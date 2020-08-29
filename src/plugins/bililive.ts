import { Bot } from 'koishi-core';
import { unix, utc } from 'moment';
import axios from 'axios';
import SiGNAL from '../main';
import PluginBase from './base';

interface BiliLiveOptions {
  interval: number,
  watch: {[roomId: string]: number[]}
}

interface Data {
  room_info: {
    live_status: number,
    live_start_time: number,
    cover: string,
    title: string
  },
  anchor_info: {
    base_info: {
      uname: string
    }
  }
}

class Worker {
  roomId: number;

  groups: number[];

  bot: Bot;

  startTime: number;

  living: boolean;

  constructor(roomId: number, groups: number[], bot: Bot) {
    this.roomId = roomId;
    this.groups = groups;
    this.bot = bot;
    this.living = false;
  }

  async check() {
    const res = await axios.get<{data: Data}>(`https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id=${this.roomId}`, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:60.0) Gecko/20100101 Firefox/60.0',
      },
    });
    const { data } = res.data;
    if (data.room_info.live_status === 1) {
      if (!this.living) {
        this.startTime = data.room_info.live_start_time;
        this.groups.forEach((group) => {
          this.bot.sendGroupMsg(group, `[CQ:image,file=${data.room_info.cover}]🌟 ${data.anchor_info.base_info.uname} 正在直播 ${data.room_info.title} ！直播间地址：https://live.bilibili.com/${this.roomId}`);
        });
      }
      this.living = true;
    } else {
      if (this.living) {
        const currentTime = utc().unix();
        const duration = unix(currentTime - this.startTime).utc().format('HH:mm:ss');
        this.groups.forEach((group) => {
          this.bot.sendGroupMsg(group, `🌟 ${data.anchor_info.base_info.uname} 直播 ${data.room_info.title} 结束，总时长 ${duration}`);
        });
      }
      this.living = false;
    }
  }
}

export default class BiliLive extends PluginBase<BiliLiveOptions> {
  apply(app: SiGNAL) {
    app.koishi.on('connect', async () => {
      const selfId = (await app.koishi.getSelfIds())[0];
      const bot = app.koishi.bots[selfId];
      Object.entries(this.options.watch).forEach(([roomId, groups]) => {
        const worker = new Worker(parseInt(roomId, 10), groups, bot);
        setInterval(() => worker.check(), this.options.interval);
      });
    });
  }
}
