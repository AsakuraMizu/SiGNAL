import axios from 'axios';
import { Context, Session } from 'koishi';
import { unix, utc } from 'moment';
import { Channel } from './base';

interface ExtractData {
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

export class BiliLive extends Channel {
  private startTime = new Map<string, number>();

  apply(ctx: Context, cb: (session: Session, id: string) => Promise<void>): void {
    ctx.command('sub.bililive <id>', 'BiliBili直播')
      .action(async ({ session }, id: string) => {
        await cb(session, id);
      });
  }

  format(id: string): string {
    return `BiliBili直播: ${id}`;
  }

  async update(id: string): Promise<string | null> {
    const res = await axios.get<{ data: ExtractData }>(`https://api.live.bilibili.com/xlive/web-room/v1/index/getInfoByRoom?room_id=${id}`, {
      headers: {
        'Accept-Language': 'en-US,en;q=0.8',
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; WOW64; rv:60.0) Gecko/20100101 Firefox/60.0',
      },
    });
    const { data } = res.data;

    if (data.room_info.live_status === 1 && !this.startTime.has(id)) {
      this.startTime.set(id, data.room_info.live_start_time);
      return `🌟 ${data.anchor_info.base_info.uname} 正在直播 ${data.room_info.title} ！直播间地址：https://live.bilibili.com/${id} [CQ:image,file=${data.room_info.cover}]`;
    }

    if (data.room_info.live_status !== 1 && this.startTime.has(id)) {
      const currentTime = utc().unix();
      const duration = unix(currentTime - this.startTime.get(id)).utc().format('HH:mm:ss');
      this.startTime.delete(id);
      return `🌟 ${data.anchor_info.base_info.uname} 直播 ${data.room_info.title} 结束，总时长 ${duration}`;
    }

    return null;
  }
}
