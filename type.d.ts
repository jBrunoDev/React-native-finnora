import type {imageSourcePropType} from 'react-native';

declare global {
    interface TabIconProps {
        focused: boolean;
        icon: imageSourcePropType;
    }
}

export {};