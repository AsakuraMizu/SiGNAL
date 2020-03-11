from nonebot import on_command, CommandSession
from redis import Redis

from config import REDIS_HOST, REDIS_PORT, REDIS_PASSWORD

r = Redis(host=REDIS_HOST, port=REDIS_PORT, password=REDIS_PASSWORD)

def enc(user):
    return 'todo_' + user

def rm(user, todo):
    print(' '.join(['rm', user, todo]))
    if r.hexists(enc(user), todo):
        r.hdel(enc(user), todo)
        return 'Removed TODO: ' + todo
    else:
        return 'No such TODO.'

def rma(user):
    print(' '.join(['rma', user]))
    return '\n'.join([rm(user, i.decode('utf-8')) for i in r.hkeys(enc(user))])

def add(user, todo, stat):
    print(' '.join(['add', user, todo, stat]))
    r.hset(enc(user), todo, stat)
    return 'Added ' + todo + ' with status: ' + stat

def mod(user, todo, stat):
    print(' '.join(['mod', user, todo, stat]))
    r.hset(enc(user), todo, stat)
    return 'Changed the status of ' + todo + ' to: ' + stat

def get(user, todo):
    print(' '.join(['get', user, todo]))
    return 'Status of ' + todo + ' is: ' + r.hget(enc(user), todo).decode('utf-8')

def geta(user):
    print(' '.join(['geta', user]))
    l = r.hgetall(enc(user))
    return 'TODOS:\n' + '\n'.join([i.decode('utf-8') + '(' +  l[i].decode('utf-8') + ')' for i in l.keys()])

@on_command('todo')
async def _(session : CommandSession):
    args = session.current_arg_text.strip().split()
    o = str(session.ctx['user_id'])
    if len(args) == 0:
        await session.send('Plz use \'?todo help\' for more.', at_sender=True)
    elif args[0] == 'a' or args[0] == 'add':
        if len(args) < 2:
            await session.send('Usage: ?todo a(dd) <TODO> [status]', at_sender=True)
        elif len(args) == 2:
            await session.send(add(o, args[1], 'WIP'), at_sender=True)
        else:
            await session.send(add(o, args[1], session.current_arg_text.split(args[1], 1)[1].strip()), at_sender=True)
    elif args[0] == 'rm' or args[0] == 'del' or args[0] == 'd':
        if len(args) < 2:
            await session.send('Usage: ?todo rm|d(el) <TODO>', at_sender=True)
        else:
            await session.send(rm(o, args[1]), at_sender=True)
    elif args[0] == 'rma' or args[0] == 'dela' or args[0] == 'da':
        await session.send(rma(o), at_sender=True)
    elif args[0] == 'list' or args[0] == 'ls':
        await session.send(geta(o), at_sender=True)
    elif args[0] == 'get':
        if len(args) < 2:
            await session.send('Usage: ?todo get <TODO>', at_sender=True)
        else:
            await session.send(get(o, args[1]), at_sender=True)
    elif args[0] == 'set':
        if len(args) < 3:
            await session.send('Usage: ?todo set <TODO> <status>', at_sender=True)
        else:
            await session.send(mod(o, args[1], session.current_arg_text.split(args[1], 1)[1].strip()), at_sender=True)
    elif args[0] == 'done':
        if len(args) < 2:
            await session.send('Usage: ?todo done <TODO>', at_sender=True)
        else:
            await session.send(mod(o, args[1], 'done'))
    elif args[0] == 'gu':
        if len(args) < 2:
            await session.send('Usage: ?todo gu <TODO>', at_sender=True)
        else:
            await session.send(mod(o, args[1], 'WIP'))
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