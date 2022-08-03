/**
 * Registry redis
 **/
import Redis from '../util/Redis';

export async function getRedisInfo(hookId) {
    try {
        const data = await Redis.get(hookId);
        if (typeof data === 'string') {
            return JSON.parse(data);
        }
        return null;
    } catch (error) {
        throw error;
    }
}

export async function deleteRedisInfo(hookId) {
    try {
        await Redis.del(hookId);
        return true;
    } catch (error) {
        throw error;
    }
}

export async function setRedisInfo(hookId, hookInfo) {
    try {
        const data = JSON.stringify(hookInfo);
        await Redis.set(hookId, data);
        return true;
    } catch (error) {
        throw error;
    }
}

export async function setRedisExpire(hookId, time) {
    try {
        await Redis.expire(hookId, time);
        return true;
    } catch (error) {
        throw error;
    }
}
