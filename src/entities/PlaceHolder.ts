import { Entity, PrimaryKey } from 'mikro-orm';

@Entity()
export class PlaceHolder {
    @PrimaryKey()
    _id!: number;
}
