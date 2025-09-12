import { RoomData } from '../generated/common/types';
import { RoomStateType } from '../generated/common/enums';
import { User } from './user.model';

export class Room implements RoomData {
	id: number;
	ownerId: string;
	name: string;
	maxUserNum: number;
	state: RoomStateType;
	users: User[];

	constructor(
		id: number,
		ownerId: string,
		name: string,
		maxUserNum: number,
		state: RoomStateType,
		users: User[],
	) {
		this.id = id;
		this.ownerId = ownerId;
		this.name = name;
		this.maxUserNum = maxUserNum;
		this.state = state;
		this.users = users;
	}
}
