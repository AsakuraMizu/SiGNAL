import { Context, Session } from 'koishi';

export abstract class Channel {
  abstract apply(ctx: Context, cb: (session: Session, id: string) => Promise<void>): void;
  abstract format(id: string): string;
  abstract update(id: string): Promise<string | null>;
}
