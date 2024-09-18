/**
 * Allow to query an object for sub-object values without crashing if sub-objects don't exist.
 */
export function nullableGet<T>(obj: any, keypath: string) {
	return nullableGetWithDefault<T | undefined>(obj, keypath, undefined);
}

export function nullableGetWithDefault<T>(obj: any, keypath: string, defaultVal: T): T {
	var curr = obj;
	for (var i = 0, path = keypath.split("."), len = path.length; i < len; i++) {
		if (curr && curr.hasOwnProperty(path[i])) {
			curr = curr[path[i]];
		} else {
			return defaultVal;
		}
	}
	return curr as T;
}

export function deleteKeypath(obj: any, keypath: string) {
	var curr = obj;
	for (var i = 0, path = keypath.split("."), len = path.length; i < len; i++) {
		if (curr && curr.hasOwnProperty(path[i])) {
			if (i === len - 1) {
				delete curr[path[i]];
			} else {
				curr = curr[path[i]];
			}
		} else {
			break;
		}
	}
	return obj;
}

export function setKeypath(obj: any, keypath: string, value: any) {
	if (!obj) return;

	const path = keypath.split(".");
	for (var i = 0; i < path.length - 1; i++) {
		if (!obj[path[i]]) {
			obj[path[i]] = {};
		}
		obj = obj[path[i]];
	}

	obj[path[i]] = value;
}
