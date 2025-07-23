import React from "react";
import { View, Text } from "react-native";
import Svg, { G, Path } from "react-native-svg";
import * as d3Shape from "d3-shape";
import { useTheme } from "../contexts/ThemeContext";

interface PieChartData {
  value: number;
  color: string;
  label: string;
}

interface AdvancePieChartProps {
  data: PieChartData[];
  size?: number;
}

export default function AdvancePieChart({ data, size = 180 }: AdvancePieChartProps) {
  const { colors } = useTheme();
  const pieData = d3Shape.pie<PieChartData>().value(d => d.value)(data);
  const radius = size / 2;
  const arcs = pieData.map((slice, i) => {
    const arc = d3Shape.arc<d3Shape.PieArcDatum<PieChartData>>()
      .outerRadius(radius)
      .innerRadius(0);
    return (
      <Path
        key={i}
        d={arc(slice) || ''}
        fill={slice.data.color}
      />
    );
  });

  return (
    <View style={{ alignItems: 'center' }}>
      <Svg width={size} height={size}>
        <G x={radius} y={radius}>
          {arcs}
        </G>
      </Svg>
      <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginTop: 12 }}>
        {data.map((item, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', marginHorizontal: 8, marginBottom: 4 }}>
            <View style={{ width: 14, height: 14, backgroundColor: item.color, borderRadius: 7, marginRight: 6 }} />
            <Text style={{ fontSize: 13, color: colors.text, textShadowColor: colors.background === '#000' ? '#fff' : '#000', textShadowOffset: { width: 0, height: 0 }, textShadowRadius: 1 }}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
} 