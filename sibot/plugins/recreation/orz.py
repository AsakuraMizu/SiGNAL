from nonebot import scheduler, get_bot, logger
from nonebot import on_command, permission
from nonebot.message import Message, MessageSegment
import datetime


from sibot import uconf

@on_command('orz', permission=permission.GROUP_ADMIN)
async def _(session):
    args = Message(session.current_arg)
    qq = None
    for i in args:
        if i['type'] == 'at':
            qq = i['data']['qq']
    try:
        if qq == None:
            raise ValueError
        gp = str(session.ctx.group_id)
        if gp not in uconf['orzlist'].keys():
            uconf['orzlist'][gp] = []
        if qq in uconf['orzlist'][gp]:
            await session.sender('[orz] 太棒了，学到虚脱')
        else:
            uconf['orzlist'][gp] = uconf['orzlist'][gp] + [qq]
            await session.sender('[orz] 太棒了，学到许多')
    except Exception as e:
        logger.exception(e)
        await session.sender('[orz] 使用方法：?orz <@要orz的人>')

@scheduler.scheduled_job('cron', minute='*/30')
async def _():
    for k, v in uconf['orzlist'].items():
        await get_bot().send_group_msg(group_id=k, message=
            datetime.datetime.now().strftime('现在是 北京时间 %H时%M分\n')
            + 'SiGNAL酱为您定时播报今日牛逼人员名单：\n' + '\n'.join([str(MessageSegment.at(i)) for i in v])
        )
