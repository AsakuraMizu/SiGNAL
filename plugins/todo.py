from nonebot import on_command, CommandSession
from pymongo import MongoClient

from config import MONGO_URL, MONGO_DB


client = MongoClient(MONGO_URL)
db = client[MONGO_DB]
coll = db['todo']


def rm(user, todo):
    print(' '.join(['rm', str(user), todo]))
    result = coll.delete_one({'uid': user, 'content': todo})
    if result.deleted_count > 0:
        res = 'Removed TODO: ' + todo
    else:
        res = 'No such TODO.'
    print(res)
    return res


def rma(user):
    print(' '.join(['rma', str(user)]))
    result = coll.delete_many({'uid': user})
    res = 'Removed ' + str(result.deleted_count) + ' TODOs.'
    print(res)
    return res


def add(user, todo, stat):
    print(' '.join(['add', str(user), todo, stat]))
    coll.insert_one({'uid': user, 'content': todo, 'status': stat})
    res = 'Added ' + todo + ' with status: ' + stat
    print(res)
    return res


def mod(user, todo, stat):
    print(' '.join(['mod', str(user), todo, stat]))
    result = coll.update_one(
        {'uid': user, 'content': todo},
        {'$set': {'status': stat}}
    )
    if result.matched_count:
        res = 'No such TODO.'
    else:
        res = 'Changed the status of ' + todo + ' to: ' + stat
    print(res)
    return res


def get(user, todo):
    print(' '.join(['get', str(user), todo]))
    result = coll.find_one({'uid': user, 'content': todo})
    res = 'Status of ' + todo + ' is: ' + result['status']
    print(res)
    return res


def geta(user):
    print(' '.join(['geta', str(user)]))
    cursor = coll.find({'uid': user})
    qryl = list(cursor.limit(10))
    resl = [i['content'] + '(' + i['status'] + ')' for i in qryl]
    res = 'TODOS:\n' + '\n'.join(resl)
    print(res)
    return res


@on_command('todo')
async def _(session: CommandSession):
    args = session.current_arg.strip().split()
    o = session.ctx['user_id']
    if len(args) == 0:
        await session.send('Plz use \'?todo help\' for more.', at_sender=True)
    elif args[0] == 'a' or args[0] == 'add':
        if len(args) < 2:
            await session.send('Usage: ?todo a(dd) <TODO> [status]', at_sender=True)
        elif len(args) == 2:
            res = add(o, args[1], 'WIP')
            await session.send(res, at_sender=True)
        else:
            res = add(o, args[1], session.current_arg_text.split(args[1], 1)[1].strip())
            await session.send(res, at_sender=True)
    elif args[0] == 'rm' or args[0] == 'del' or args[0] == 'd':
        if len(args) < 2:
            await session.send('Usage: ?todo rm|d(el) <TODO>', at_sender=True)
        else:
            res = rm(o, args[1])
            await session.send(res, at_sender=True)
    elif args[0] == 'rma' or args[0] == 'dela' or args[0] == 'da':
        res = rma(o)
        await session.send(res, at_sender=True)
    elif args[0] == 'list' or args[0] == 'ls':
        res = geta(o)
        await session.send(res, at_sender=True)
    elif args[0] == 'get':
        if len(args) < 2:
            await session.send('Usage: ?todo get <TODO>', at_sender=True)
        else:
            res = get(o, args[1])
            await session.send(res, at_sender=True)
    elif args[0] == 'set':
        if len(args) < 3:
            await session.send('Usage: ?todo set <TODO> <status>', at_sender=True)
        else:
            res = mod(o, args[1], session.current_arg_text.split(args[1], 1)[1].strip())
            await session.send(res, at_sender=True)
    elif args[0] == 'done':
        if len(args) < 2:
            await session.send('Usage: ?todo done <TODO>', at_sender=True)
        else:
            res = mod(o, args[1], 'done')
            await session.send(res, at_sender=True)
    elif args[0] == 'gu':
        if len(args) < 2:
            await session.send('Usage: ?todo gu <TODO>', at_sender=True)
        else:
            res = mod(o, args[1], 'WIP')
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
