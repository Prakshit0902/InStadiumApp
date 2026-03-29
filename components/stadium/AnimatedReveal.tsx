import { PropsWithChildren } from 'react';
import Animated, { FadeInUp } from 'react-native-reanimated';

type Props = PropsWithChildren<{
  delay?: number;
}>;

export function AnimatedReveal({ children, delay = 0 }: Props) {
  return <Animated.View entering={FadeInUp.delay(delay).duration(450)}>{children}</Animated.View>;
}
