from nonebot import on_command, CommandSession
import platform
import psutil

from utils import get_size


@on_command('status')
async def _(session: CommandSession):
    res = '[SiGNAL] 运行状态\n'
    login_info = await session.bot.get_login_info()
    qq = login_info['user_id']
    name = login_info['nickname']
    res += '登录账号: {}({})\n'.format(name, qq)

    version_info = await session.bot.get_version_info()
    res += '酷Q版本: {}\n'.format(version_info['coolq_edition'])

    plugin_version = version_info['plugin_version']
    plugin_build_number = version_info['plugin_build_number']
    plugin_build_configuration = version_info['plugin_build_configuration']
    res += 'HTTP API: {}-{}-{}\n'.format(plugin_version, plugin_build_number, plugin_build_configuration)

    await session.sender(res)

@on_command('sysinfo')
async def _(session: CommandSession):
    res = '[SiGNAL] 系统状态\n'
    res += '操作系统: {}\n计算机名: {}\n'.format(platform.platform(), platform.node())

    res += '=====\n'
    res += 'CPU使用率: {}%\n'.format(psutil.cpu_percent())
    vmem = psutil.virtual_memory()
    res += '内存使用率: {} / {} ({}%)\n'.format(get_size(vmem.used), get_size(vmem.total), vmem.percent)
    swap = psutil.swap_memory()
    res += '交换空间使用率: {} / {} ({}%)\n'.format(get_size(swap.used), get_size(swap.total), swap.percent)

    res += '=====\n硬盘使用情况:\n'
    partitions = psutil.disk_partitions()
    for part in partitions:
        res += '{} on {} type {}'.format(part.device, part.mountpoint, part.fstype)
        try:
            usage = psutil.disk_usage(part.mountpoint)
            res += ' {} / {} ({}%)'.format(get_size(usage.used), get_size(usage.total), usage.percent)
        except:
            pass
        res += '\n'
    await session.sender(res)
