from sibot import on_command, CommandSession
import platform
import psutil


def get_size(bytes, suffix="B"):
    """
    Scale bytes to its proper format
    e.g:
        1253656 => '1.20MB'
        1253656678 => '1.17GB'
    """
    factor = 1024
    for unit in ["", "K", "M", "G", "T", "P"]:
        if bytes < factor:
            return f"{bytes:.2f}{unit}{suffix}"
        bytes /= factor


@on_command('status')
async def _(session: CommandSession):
    info = await session.bot.get_about()
    await session.reply('\n'.join([
        '[SiGNAL] 运行状态',
        '登录账号：{}'.format(session.bot.qq),
        'Mirai API HTTP 插件版本: {}'.format(info['data']['version'])
    ]))


@on_command('sysinfo')
async def _(session: CommandSession):
    def gen_part(part) -> str:
        res = f'{part.device} on {part.mountpoint} type {part.fstype}'
        try:
            usage = psutil.disk_usage(part.mountpoint)
            res += f' {get_size(usage.used)} / {get_size(usage.total)} ({usage.percent}%)'
        except:
            pass
        return res

    await session.reply('\n'.join([
        '[SiGNAL] 系统状态',
        f'操作系统: {platform.platform()}',
        f'计算机名: {platform.node()}',
        '=====',
        f'CPU使用率: {psutil.cpu_percent()}%',
        (lambda vmem: f'内存使用率: {get_size(vmem.used)} / {get_size(vmem.total)}'
                      f'({vmem.percent}%)')(psutil.virtual_memory()),
        (lambda swap: f'交换空间使用率: {get_size(swap.used)} / {get_size(swap.total)}'
                      f'({swap.percent}%)')(psutil.swap_memory()),
        '=====',
        '硬盘使用情况：',
        *[gen_part(part) for part in psutil.disk_partitions()]
    ]))
