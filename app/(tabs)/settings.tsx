import {View, Text, Pressable} from 'react-native';
import React from 'react';
import {styled} from "nativewind";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";
import {useClerk} from "@clerk/expo";

const SafeAreaView = styled(RNSafeAreaView);

const Settings = () => {
    const {signOut} = useClerk();

    return (
        <SafeAreaView className="flex-1 bg-background p-5">
            <Text className="text-2xl font-sans-bold text-primary mb-6">Settings</Text>

            <Pressable
                className="auth-secondary-button"
                onPress={() => signOut()}
            >
                <Text className="auth-secondary-button-text">Sign out</Text>
            </Pressable>
        </SafeAreaView>
    );
}

export default Settings;
