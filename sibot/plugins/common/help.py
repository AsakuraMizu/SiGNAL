from sibot import on_command, CommandSession, MessageChain
from sibot import on_event, get_bot


@on_command('help')
async def _(session: CommandSession):
    await session.reply(
        'SiGNAL酱是一个免费、开源的QQ机器人，主要服务于开发人员，能够提供许多专业需求。'
        '当然SiGNAL酱也提供了一些其他的功能，详见 https://signal.solariar.tech/'
    )


@on_command('about')
async def _(session: CommandSession):
    repos = {
        'mirai': 'https://github.com/mamoe/mirai',
        'mirai-console': 'https://github.com/mamoe/mirai-console',
        'mirai-api-http': 'https://github.com/mamoe/mirai-api-http',
        'mirai-docker': 'https://github.com/AsakuraMizu/mirai-docker',
        'aiomirai': 'https://github.com/AsakuraMizu/aiomirai',
        'mirai-webhook': 'https://github.com/AsakuraMizu/mirai-webhook',
        'hikaru(ctd comm fork)': 'https://github.com/CytoidCommunity/hikaru',
        'tairitsuru': 'https://github.com/CytoidCommunity/tairitsuru',
    }
    await session.reply('\n'.join([
        'SiGNAL酱的运行离不开以下项目，去他们的项目页看看，'
        '点个 Star 以鼓励他们的开发工作，毕竟没有他们也没有 SiGNAL Bot.',
        *[f'{k}: {v}' for k, v in repos.items()],
        '===SiGNAL Bot的源代码仓库===',
        'https://github.com/AsakuraMizu/SiGNAL/'
    ]))


@on_event('BotJoinGroupEvent')
async def _(event):
    await get_bot().send_group_message(
        target=event['group']['id'],
        message_chain=MessageChain(
            '大家好，我是SiGNAL酱，有关我的详细信息可输入 ?help 查看哦~'
        )
    )
