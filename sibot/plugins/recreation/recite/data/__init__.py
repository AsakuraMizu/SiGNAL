from . import bbb
from . import qiunile
from . import tukuai
from .lyrics import *


data = {
    "^(土块|赌怪)$": tukuai.tukuai,
    "^(阿姨|卡布奇诺)$": tukuai.ayi,
    "^求你了(别发了)?$": qiunile.origin,
    "^求你了(别发了)? arc$": qiunile.arc,
    "^求你了(别发了)? cy2$": qiunile.cy2,
    "^求你了(别发了)? oi$": qiunile.oi,
    "^(脑力|(B|b)rain( ?)(P|p)ower)$": brainp.data,
    "^你们这个是什么群啊$": bbb.data
}