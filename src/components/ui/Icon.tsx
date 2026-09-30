import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import type { ComponentProps } from 'react';

export type IconName = ComponentProps<typeof MaterialCommunityIcons>['name'];

interface Props {
  name: IconName;
  size?: number;
  color: string;
}

export const Icon = ({ name, size = 24, color }: Props) => (
  <MaterialCommunityIcons name={name} size={size} color={color} />
);
