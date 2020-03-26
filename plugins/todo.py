from nonebot import on_command, CommandSession
from motor.motor_asyncio import AsyncIOMotorClient

from utils import get_coll, sender


getcoll = lambda: get_coll('todo')

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
        await sender(session, 'Plz use \'?todo help\' for more.')
    elif args[0] == 'a' or args[0] == 'add':
        if len(args) < 2:
            await sender(session, 'Usage: ?todo a(dd) <TODO> [status]')
        elif len(args) == 2:
            res = await add(op, args[1], 'WIP')
            await sender(session, res)
        else:
            res = await add(op, args[1], session.current_arg_text.split(args[1], 1)[1].strip())
            await sender(session, res)
    elif args[0] == 'rm' or args[0] == 'del' or args[0] == 'd':
        if len(args) < 2:
            await sender(session, 'Usage: ?todo rm|d(el) <TODO>')
        else:
            res = await rm(op, args[1])
            await sender(session, res)
    elif args[0] == 'rma' or args[0] == 'dela' or args[0] == 'da':
        res = await rma(op)
        await sender(session, res)
    elif args[0] == 'list' or args[0] == 'ls':
        res = await geta(op)
        await sender(session, res)
    elif args[0] == 'get':
        if len(args) < 2:
            await sender(session, 'Usage: ?todo get <TODO>')
        else:
            res = await get(op, args[1])
            await sender(session, res)
    elif args[0] == 'set':
        if len(args) < 3:
            await sender(session, 'Usage: ?todo set <TODO> <status>')
        else:
            res = await mod(op, args[1], session.current_arg_text.split(args[1], 1)[1].strip())
            await sender(session, res)
    elif args[0] == 'done':
        if len(args) < 2:
            await sender(session, 'Usage: ?todo done <TODO>')
        else:
            res = await mod(op, args[1], 'done')
            await sender(session, res)
    elif args[0] == 'gu':
        if len(args) < 2:
            await sender(session, 'Usage: ?todo gu <TODO>')
        else:
            res = await mod(op, args[1], 'WIP')
            await sender(session, res)
    elif args[0] == 'help':
        await sender(session, '''
Usage:
?todo a(dd) <TODO> [status]
?todo rm|d(el) <TODO>
?todo rma|d(el)a
?todo list|ls
?todo get <TODO>
?todo set <TODO> <status>
?todo done <TODO>
?todo gu <TODO>
?todo help''')
    else:
        await sender(session, 'Plz use \'?todo help\' for more.')
