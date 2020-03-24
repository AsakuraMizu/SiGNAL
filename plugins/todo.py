from nonebot import on_command, CommandSession, logger
from motor.motor_asyncio import AsyncIOMotorClient

from config import MONGO_URL, MONGO_DB


def getcoll():
    return AsyncIOMotorClient(MONGO_URL)[MONGO_DB]['todo']

async def rm(user, todo):
    coll = getcoll()
    result = await coll.delete_one({'uid': user, 'content': todo})
    if result.deleted_count > 0:
        res = 'Removed TODO: ' + todo
    else:
        res = 'No such TODO.'
    return res


async def rma(user):
    coll = getcoll()
    result = await coll.delete_many({'uid': user})
    res = 'Removed ' + str(result.deleted_count) + ' TODOs.'
    return res


async def add(user, todo, stat):
    coll = getcoll()
    await coll.insert_one({'uid': user, 'content': todo, 'status': stat})
    res = 'Added ' + todo + ' with status: ' + stat
    return res


async def mod(user, todo, stat):
    coll = getcoll()
    result = await coll.update_one(
        {'uid': user, 'content': todo},
        {'$set': {'status': stat}}
    )
    if result.matched_count > 0:
        res = 'Changed the status of ' + todo + ' to: ' + stat
    else:
        res = 'No such TODO.'
    return res


async def get(user, todo):
    coll = getcoll()
    result = await coll.find_one({'uid': user, 'content': todo})
    res = 'Status of ' + todo + ' is: ' + result['status']
    return res


async def geta(user):
    coll = getcoll()
    cursor = coll.find({'uid': user})
    qryl = await cursor.to_list(length=10)
    resl = [i['content'] + '(' + i['status'] + ')' for i in qryl]
    res = 'TODOS:\n' + '\n'.join(resl)
    return res


@on_command('todo', shell_like=True)
async def _(session: CommandSession):
    args = session.argv
    op = session.ctx['user_id']
    if len(args) == 0:
        await session.send('Plz use \'?todo help\' for more.', at_sender=True)
    elif args[0] == 'a' or args[0] == 'add':
        if len(args) < 2:
            await session.send('Usage: ?todo a(dd) <TODO> [status]', at_sender=True)
        elif len(args) == 2:
            res = await add(op, args[1], 'WIP')
            await session.send(res, at_sender=True)
        else:
            res = await add(op, args[1], session.current_arg_text.split(args[1], 1)[1].strip())
            await session.send(res, at_sender=True)
    elif args[0] == 'rm' or args[0] == 'del' or args[0] == 'd':
        if len(args) < 2:
            await session.send('Usage: ?todo rm|d(el) <TODO>', at_sender=True)
        else:
            res = await rm(op, args[1])
            await session.send(res, at_sender=True)
    elif args[0] == 'rma' or args[0] == 'dela' or args[0] == 'da':
        res = await rma(op)
        await session.send(res, at_sender=True)
    elif args[0] == 'list' or args[0] == 'ls':
        res = await geta(op)
        await session.send(res, at_sender=True)
    elif args[0] == 'get':
        if len(args) < 2:
            await session.send('Usage: ?todo get <TODO>', at_sender=True)
        else:
            res = await get(op, args[1])
            await session.send(res, at_sender=True)
    elif args[0] == 'set':
        if len(args) < 3:
            await session.send('Usage: ?todo set <TODO> <status>', at_sender=True)
        else:
            res = await mod(op, args[1], session.current_arg_text.split(args[1], 1)[1].strip())
            await session.send(res, at_sender=True)
    elif args[0] == 'done':
        if len(args) < 2:
            await session.send('Usage: ?todo done <TODO>', at_sender=True)
        else:
            res = await mod(op, args[1], 'done')
            await session.send(res, at_sender=True)
    elif args[0] == 'gu':
        if len(args) < 2:
            await session.send('Usage: ?todo gu <TODO>', at_sender=True)
        else:
            res = await mod(op, args[1], 'WIP')
            await session.send(res, at_sender=True)
    elif args[0] == 'help':
        await session.send('''
Usage:
?todo a(dd) <TODO> [status]
?todo rm|d(el) <TODO>
?todo rma|d(el)a
?todo list|ls
?todo get <TODO>
?todo set <TODO> <status>
?todo done <TODO>
?todo gu <TODO>
?todo help''', at_sender=True)
    else:
        await session.send('Plz use \'?todo help\' for more.', at_sender=True)
