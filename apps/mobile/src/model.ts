import profilesData from '../../../data/synthetic/profiles.json';

export const profiles = profilesData;
export const tabs = ['Início', 'Histórico', 'Registar', 'Aprender', 'Perfil'] as const;
export type Tab = typeof tabs[number];
export const areas = ['Análises ao sangue', 'Tensão arterial', 'Saúde respiratória', 'Medicação e consultas', 'Saúde geral e prevenção'] as const;
export type Area = typeof areas[number];
export type State = { profileId: string; tab: Tab; area: Area | null };
export const initialState: State = { profileId: profiles[0].id, tab: 'Início', area: null };
export type Action = {type:'profile'; id:string} | {type:'tab'; tab:Tab} | {type:'area'; area:Area};
export function reducer(state:State, action:Action):State {
 if(action.type==='profile') {
  if(!profiles.some(p=>p.id===action.id)) return state;
  return {...initialState, profileId:action.id};
 }
 if(action.type==='tab') return {...state,tab:action.tab,area:null};
 return {...state,area:action.area};
}

