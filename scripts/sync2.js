import 'dotenv/config'; // 加载 .env 文件

import { MongoClient } from 'mongodb';
const local_dbName = "bibleDB"
const remote_dbName = "bibleDB"

const localUri = process.env.local_uri;
const remoteUri = process.env.remote_uri;
// const remoteUri = process.env.local_uri;

const SYNC_COLLECTION = 'sync';
const VERSES_COLLECTION = 'verses';


async function sync() {
    const localClient = new MongoClient(localUri);
    const remoteClient = new MongoClient(remoteUri);

    await localClient.connect();
    await remoteClient.connect();

    const localDb = localClient.db(local_dbName);
    const remoteDb = remoteClient.db(remote_dbName);



    // 读取 lastSyncedAt 时间戳
    const localSync = await localDb.collection(SYNC_COLLECTION).findOne({}, { sort: { timestamp: -1 } });
    const remoteSync = await remoteDb.collection(SYNC_COLLECTION).findOne({}, { sort: { timestamp: -1 } });
    // const lastSyncedAt = new Date(
    //     Math.max(
    //         localSync?.lastSyncedAt?.getTime() || 0,
    //         remoteSync?.lastSyncedAt?.getTime() || 0
    //     )
    // );
    console.log(`localSync:${JSON.stringify(localSync)},remoteSync:${JSON.stringify(remoteSync)}`);

    // 1. 获得本地集合中 > lastSyncedAt 的记录
    const new_collect_local = await localDb.collection(VERSES_COLLECTION)
        .find({ updatedAt: { $gt: localSync.timestamp } }).toArray();
    console.log(`本地集合更新的个数：${new_collect_local.length}`)

    // 2. 获得远程集合中 > lastSyncedAt 的记录
    const new_collect_remote = await remoteDb.collection(VERSES_COLLECTION)
        .find({ updatedAt: { $gt: remoteSync.timestamp } }).toArray();
    console.log(`远程集合更新的个数：${new_collect_remote.length}`)

    // 3. 初始化两个要更新的数组
    const array_will_to_update_local = [];
    const array_will_to_update_remote = [];

    // 方便查找：构造 refId => 记录 的映射
    const map_local = Object.fromEntries(new_collect_local.map(doc => [doc.refId, doc]));
    const map_remote = Object.fromEntries(new_collect_remote.map(doc => [doc.refId, doc]));

    console.log(`本地map： `, map_local);
    console.log(`远程map: `, map_remote);
    // console.log(new_collect_remote);
    // 4. 处理 local 更新情况
    for (const record of new_collect_local) {
        const remoteRecord = map_remote[record.refId];
        if (!remoteRecord) {
            array_will_to_update_remote.push(record);
        } else {
            if (record.updatedAt > remoteRecord.updatedAt) {
                array_will_to_update_remote.push(record);
            } else {
                array_will_to_update_local.push(remoteRecord);
            }
        }
    }
    console.log(`处理本地集合结果：`);
    console.log(`array_will_to_update_remote:${array_will_to_update_remote.length}`);
    console.log(`array_will_to_update_local:${array_will_to_update_local.length}`);

    // 5. 处理 remote 更新情况（不重复添加）
    for (const record of new_collect_remote) {
        const localRecord = map_local[record.refId];
        if (!localRecord) {
            array_will_to_update_local.push(record);
        } else {
            if (record.updatedAt > localRecord.updatedAt) {
                array_will_to_update_local.push(record);
            } else {
                array_will_to_update_remote.push(localRecord);
            }
        }
    }
    console.log(`处理远程集合结果：`);
    console.log(`array_will_to_update_remote:${array_will_to_update_remote.length}`);
    console.log(`array_will_to_update_local:${array_will_to_update_local.length}`);

    // return;
    // console.log("不应该执行到这里");
    // 6. 更新记录到远程
    if (array_will_to_update_remote.length > 0) {
        const ops = array_will_to_update_remote.map(record => {
            const { _id, ...docWithoutId } = record;
            return {
                replaceOne: {
                    filter: { refId: record.refId },
                    replacement: docWithoutId,
                    upsert: true,
                }
            };
        });

        await remoteDb.collection(VERSES_COLLECTION).bulkWrite(ops);
    }
    console.log("更新远程完毕");
    // 7. 更新记录到本地
    if (array_will_to_update_local.length > 0) {
        const ops = array_will_to_update_local.map(record => {
            const { _id, ...docWithoutId } = record;
            return {
                replaceOne: {
                    filter: { refId: record.refId },
                    replacement: docWithoutId,
                    upsert: true,
                }
            };
        });

        await localDb.collection(VERSES_COLLECTION).bulkWrite(ops);
    }

    const now = new Date();
    // 8. 更新 sync 时间戳
    await Promise.all([
        localDb.collection(SYNC_COLLECTION).insertOne({ timestamp: now }),

        remoteDb.collection(SYNC_COLLECTION).insertOne({ timestamp: now }),
    ]);

    console.log(`✅ 同步完成！本地更新 ${array_will_to_update_local.length} 条，远程更新 ${array_will_to_update_remote.length} 条`);

    await localClient.close();
    await remoteClient.close();
}

sync().catch(err => {
    console.error('❌ 同步失败:', err);
});
