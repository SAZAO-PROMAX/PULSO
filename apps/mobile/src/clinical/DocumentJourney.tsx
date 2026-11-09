import React from 'react';
import {View} from 'react-native';
import {T,layout,useTheme} from '../ui';
export function DocumentJourney({current}:{current:0|1|2|3}){
 const {colors:c}=useTheme(),labels=['Documento','Preparar','Rever','Guardar'];
 return <View accessibilityLabel={'Etapa '+(current+1)+' de 4 · '+labels[current]} accessibilityLiveRegion="polite" testID="document-journey" style={{gap:10,paddingBottom:16,borderBottomWidth:1,borderColor:c.line}}>
 <View style={layout.row}>{labels.map((label,i)=><View key={label} style={{flexDirection:'row',alignItems:'center',gap:6,paddingVertical:4,paddingHorizontal:8,borderRadius:8,backgroundColor:i===current?c.soft:'transparent'}}><T kind="small" style={{fontWeight:i===current?'700':'400',color:i===current?c.ink:c.muted}}>{i<current?'✓':i+1} {label}{i===current?' · atual':''}</T></View>)}</View>
 </View>;
}
