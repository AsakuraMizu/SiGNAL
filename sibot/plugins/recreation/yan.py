from nonebot import on_command, on_natural_language
from nonebot.argparse import ArgumentParser
from random import randint
from re import escape

from sibot.utils import get_coll


def _gen(cmd: str, name: str, rec: dict):
    geco = lambda: get_coll(cmd)

    async def record(event):
        if event.user_id in rec.keys():
            coll = geco()
            await coll.insert_one({'name': rec[event.user_id], 'content': event.raw_message})

    async def rand(args):
        coll = geco()
        cursor = coll.find()
        all = await cursor.to_list(length=None)
        rtn = all[randint(0, len(all) - 1)]
        return f"[{name}] {rtn['name']}:\n{rtn['content']}"

    async def info(args):
        coll = geco()
        size = await coll.estimated_document_count()
        return f"[{name}] 距今已有 {size} 条{name}于数据库中"

    async def query(args):
        coll = geco()
        cursor = coll.find({'content': {'$regex': escape(args.keyword)}})
        all = await cursor.to_list(length=None)
        if len(all):
            rtn = all[randint(0, len(all) - 1)]
            return f"[{name}] {rtn['name']}:\n{rtn['content']}"
        else:
            return f"[{name}] {rec.values()[0]}: 我没说过"

    @on_natural_language
    async def _(session):
        await record(session.ctx)

    @on_command(cmd, shell_like=True)
    async def _(session):
        parser = ArgumentParser(session=session, usage='')
        parser.set_defaults(func=rand)

        subparsers = parser.add_subparsers()

        parser_info = subparsers.add_parser('info')
        parser_info.set_defaults(func=info)

        parser_query = subparsers.add_parser('query')
        parser_query.add_argument('keyword', help='关键词')
        parser_query.set_defaults(func=query)

        args = parser.parse_args(session.argv)
        await session.sender(await args.func(args))
        await record(session.ctx)

_gen('lxyan', '雪言', {2941383730: '落雪ちゃん', 462928960: '软糖酱私用机'})
_gen('baiyan', '白言', {1395644591: '洛歆白'})
