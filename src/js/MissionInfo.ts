const kcwikiMissionInfoUrl = "https://api.kcwiki.moe/missions";

async function getMissionInfo(): Promise<MissionInfo> {
  const resp = (await fetch(kcwikiMissionInfoUrl)).json();
  return resp;
}

interface MissionInfo {
  "id": number,				// 远征 ID
  "maparea_id": number,		// 海域分类 ID
  "name": string,			// 远征名称
  "details": string,		// 远征描述
  "time": number,				// 远征耗时
  "difficulty": number,		// 难度
  "use_fuel": number,			// 燃料消耗百分比
  "use_bull": number,			// 子弹消耗百分比
  "win_item1": Array<number>,	// 获得资源1 [0]=Item ID, [1]=数量
  "win_item2": Array<number>,	// 获得资源2
  "return_flag": number 		// 远征是否可以终止
}

export {
  getMissionInfo as getMissionInfo,
  MissionInfo as MissionInfo
};