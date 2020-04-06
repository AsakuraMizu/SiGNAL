from nonebot import on_command, CommandSession
from nonebot.argparse import ArgumentParser

from sibot.utils import get_coll


getcoll = lambda: get_coll('todo')

async def rm(user, args):
    todo = args.todo
    if todo == None:
        raise RuntimeError
    coll = getcoll()
    result = await coll.delete_one({'uid': user, 'content': todo})
    if result.deleted_count > 0:
        res = 'Removed TODO: ' + todo
    else:
        res = 'No such TODO.'
    return res

async def rma(user, args):
    coll = getcoll()
    result = await coll.delete_many({'uid': user})
    res = 'Removed ' + str(result.deleted_count) + ' TODOs.'
    return res

async def add(user, args):
    todo = args.todo
    if todo == None:
        raise RuntimeError
    stat = args.stat
    coll = getcoll()
    await coll.insert_one({'uid': user, 'content': todo, 'status': stat})
    res = 'Added ' + todo + ' with status: ' + stat
    return res

async def mod(user, args):
    todo = args.todo
    stat = args.stat
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

async def get(user, args):
    todo = args.todo
    if todo == None:
        raise RuntimeError
    coll = getcoll()
    result = await coll.find_one({'uid': user, 'content': todo})
    res = 'Status of ' + todo + ' is: ' + result['status']
    return res

async def geta(user, args):
    coll = getcoll()
    cursor = coll.find({'uid': user})
    qryl = await cursor.to_list(length=10)
    resl = [i['content'] + '(' + i['status'] + ')' for i in qryl]
    res = 'TODOS:\n' + '\n'.join(resl)
    return res


@on_command('todo', shell_like=True)
async def _(session):
    uid = session.ctx['user_id']

    parser = ArgumentParser(session=session)
    parser.set_defaults(func=geta)

    subparsers = parser.add_subparsers()

    parser_add = subparsers.add_parser('add', aliases=['a'])
    parser_add.add_argument('todo')
    parser_add.add_argument('stat', nargs='?', default='WIP')
    parser_add.set_defaults(func=add)

    parser_get = subparsers.add_parser('get')
    parser_get.add_argument('todo')
    parser_get.set_defaults(func=get)

    parser_ls = subparsers.add_parser('ls')
    parser_ls.set_defaults(func=geta)

    parser_mod = subparsers.add_parser('set', aliases=['m', 'mod'])
    parser_mod.add_argument('todo')
    parser_mod.add_argument('stat')
    parser_mod.set_defaults(func=mod)

    parser_rm = subparsers.add_parser('rm', aliases=['d', 'del'])
    parser_rm.add_argument('todo')
    parser_rm.set_defaults(func=rm)

    parser_rma = subparsers.add_parser('rma', aliases=['da', 'clear'])
    parser_rma.set_defaults(func=rma)

    args = parser.parse_args(session.argv)
    await session.sender(await args.func(uid, args))
