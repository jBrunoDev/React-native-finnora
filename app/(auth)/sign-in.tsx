import {useSignIn} from "@clerk/expo";
import {type Href, Link, useRouter} from "expo-router";
import React from "react";
import {
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    Text,
    TextInput,
    View,
} from "react-native";
import {styled} from "nativewind";
import {SafeAreaView as RNSafeAreaView} from "react-native-safe-area-context";

const SafeAreaView = styled(RNSafeAreaView);

export default function SignIn() {
    const {signIn, errors, fetchStatus} = useSignIn();
    const router = useRouter();

    const [emailAddress, setEmailAddress] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [code, setCode] = React.useState("");

    const isLoading = fetchStatus === "fetching";
    const canSubmit = emailAddress.trim().length > 0 && password.length > 0 && !isLoading;

    const handleSignIn = async () => {
        const {error} = await signIn.password({
            emailAddress: emailAddress.trim(),
            password,
        });

        if (error) return;

        if (signIn.status === "complete") {
            await signIn.finalize({
                navigate: ({decorateUrl}) => {
                    const url = decorateUrl("/");
                    if (url.startsWith("http")) {
                        // web fallback — won't happen in native
                    } else {
                        router.replace(url as Href);
                    }
                },
            });
        } else if (signIn.status === "needs_client_trust") {
            const emailFactor = signIn.supportedSecondFactors?.find(
                (f) => f.strategy === "email_code",
            );
            if (emailFactor) await signIn.mfa.sendEmailCode();
        }
    };

    const handleVerify = async () => {
        await signIn.mfa.verifyEmailCode({code});

        if (signIn.status === "complete") {
            await signIn.finalize({
                navigate: ({decorateUrl}) => {
                    const url = decorateUrl("/");
                    if (url.startsWith("http")) {
                        // web fallback
                    } else {
                        router.replace(url as Href);
                    }
                },
            });
        }
    };

    // Email verification step
    if (signIn.status === "needs_client_trust") {
        return (
            <SafeAreaView className="auth-safe-area">
                <KeyboardAvoidingView
                    style={{flex: 1}}
                    behavior={Platform.OS === "ios" ? "padding" : "height"}
                >
                    <ScrollView className="auth-scroll" contentContainerStyle={{flexGrow: 1}}>
                        <View className="auth-content">
                            <View className="auth-brand-block">
                                <View className="auth-logo-wrap">
                                    <View className="auth-logo-mark">
                                        <Text className="auth-logo-mark-text">F</Text>
                                    </View>
                                    <View>
                                        <Text className="auth-wordmark">Finnora</Text>
                                        <Text className="auth-wordmark-sub">Subscription Tracker</Text>
                                    </View>
                                </View>
                                <Text className="auth-title">Check your inbox</Text>
                                <Text className="auth-subtitle">
                                    We sent a verification code to{"\n"}{emailAddress.trim()}
                                </Text>
                            </View>

                            <View className="auth-card">
                                <View className="auth-form">
                                    <View className="auth-field">
                                        <Text className="auth-label">Verification code</Text>
                                        <TextInput
                                            className={`auth-input${errors.fields.code ? " auth-input-error" : ""}`}
                                            value={code}
                                            onChangeText={setCode}
                                            placeholder="6-digit code"
                                            placeholderTextColor="rgba(0,0,0,0.35)"
                                            keyboardType="numeric"
                                            maxLength={6}
                                        />
                                        {errors.fields.code && (
                                            <Text className="auth-error">{errors.fields.code.message}</Text>
                                        )}
                                    </View>

                                    <Pressable
                                        className={`auth-button${isLoading || code.length < 6 ? " auth-button-disabled" : ""}`}
                                        onPress={handleVerify}
                                        disabled={isLoading || code.length < 6}
                                    >
                                        <Text className="auth-button-text">
                                            {isLoading ? "Verifying…" : "Verify code"}
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        className="auth-secondary-button"
                                        onPress={() => signIn.mfa.sendEmailCode()}
                                        disabled={isLoading}
                                    >
                                        <Text className="auth-secondary-button-text">Resend code</Text>
                                    </Pressable>
                                </View>
                            </View>

                            <View className="auth-link-row">
                                <Pressable onPress={() => signIn.reset()}>
                                    <Text className="auth-link">Use a different account</Text>
                                </Pressable>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    // Main sign-in form
    return (
        <SafeAreaView className="auth-safe-area">
            <KeyboardAvoidingView
                style={{flex: 1}}
                behavior={Platform.OS === "ios" ? "padding" : "height"}
            >
                <ScrollView className="auth-scroll" contentContainerStyle={{flexGrow: 1}}>
                    <View className="auth-content">
                        <View className="auth-brand-block">
                            <View className="auth-logo-wrap">
                                <View className="auth-logo-mark">
                                    <Text className="auth-logo-mark-text">F</Text>
                                </View>
                                <View>
                                    <Text className="auth-wordmark">Finnora</Text>
                                    <Text className="auth-wordmark-sub">Subscription Tracker</Text>
                                </View>
                            </View>
                            <Text className="auth-title">Welcome back</Text>
                            <Text className="auth-subtitle">
                                Sign in to continue managing your subscriptions
                            </Text>
                        </View>

                        <View className="auth-card">
                            <View className="auth-form">
                                <View className="auth-field">
                                    <Text className="auth-label">Email</Text>
                                    <TextInput
                                        className={`auth-input${errors.fields.identifier ? " auth-input-error" : ""}`}
                                        value={emailAddress}
                                        onChangeText={setEmailAddress}
                                        placeholder="Enter your email"
                                        placeholderTextColor="rgba(0,0,0,0.35)"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    {errors.fields.identifier && (
                                        <Text className="auth-error">
                                            {errors.fields.identifier.message}
                                        </Text>
                                    )}
                                </View>

                                <View className="auth-field">
                                    <Text className="auth-label">Password</Text>
                                    <TextInput
                                        className={`auth-input${errors.fields.password ? " auth-input-error" : ""}`}
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="Enter your password"
                                        placeholderTextColor="rgba(0,0,0,0.35)"
                                        secureTextEntry
                                    />
                                    {errors.fields.password && (
                                        <Text className="auth-error">
                                            {errors.fields.password.message}
                                        </Text>
                                    )}
                                </View>

                                <Pressable
                                    className={`auth-button${!canSubmit ? " auth-button-disabled" : ""}`}
                                    onPress={handleSignIn}
                                    disabled={!canSubmit}
                                >
                                    <Text className="auth-button-text">
                                        {isLoading ? "Signing in…" : "Sign in"}
                                    </Text>
                                </Pressable>

                                <View className="auth-link-row">
                                    <Text className="auth-link-copy">New here?</Text>
                                    <Link href="/sign-up">
                                        <Text className="auth-link">Create an account</Text>
                                    </Link>
                                </View>
                            </View>
                        </View>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
