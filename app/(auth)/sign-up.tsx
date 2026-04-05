import {useSignUp} from "@clerk/expo";
import {useUser} from "@clerk/expo";
import {type Href, Link, useRouter} from "expo-router";
import * as ImagePicker from "expo-image-picker";
import React from "react";
import {
    Image,
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

export default function SignUp() {
    const {signUp, errors, fetchStatus} = useSignUp();
    const {user} = useUser();
    const router = useRouter();

    const [emailAddress, setEmailAddress] = React.useState("");
    const [password, setPassword] = React.useState("");
    const [username, setUsername] = React.useState("");
    const [code, setCode] = React.useState("");
    const [avatarUri, setAvatarUri] = React.useState<string | null>(null);
    const [readyToFinish, setReadyToFinish] = React.useState(false);
    const uploadedRef = React.useRef(false);

    const isLoading = fetchStatus === "fetching";
    const canSubmit =
        emailAddress.trim().length > 0 &&
        password.length > 0 &&
        username.trim().length >= 3 &&
        !isLoading;

    // After finalize activates the session, upload photo then navigate
    React.useEffect(() => {
        if (!readyToFinish || !user || uploadedRef.current) return;
        uploadedRef.current = true;

        (async () => {
            if (avatarUri) {
                try {
                    await user.setProfileImage({
                        file: {
                            uri: avatarUri,
                            name: "avatar.jpg",
                            type: "image/jpeg",
                        },
                    });

                    await user.reload(); // 🔥 importante
                } catch (err) {
                    console.log("Erro upload:", err);
                }
            }

            router.replace("/");
        })();
    }, [readyToFinish, user]);

    const pickImage = async () => {
        const {status} = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") return;

        const result = await ImagePicker.launchImageLibraryAsync({
            mediaTypes: "images",
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.8,
        });

        if (!result.canceled) {
            setAvatarUri(result.assets[0].uri);
        }
    };

    const handleSignUp = async () => {
        const {error} = await signUp.password({
            emailAddress: emailAddress.trim(),
            password,
            username: username.trim(),
        });

        if (error) return;

        await signUp.verifications.sendEmailCode();
    };

    const handleVerify = async () => {
        await signUp.verifications.verifyEmailCode({code});

        if (signUp.status === "complete") {
            await signUp.finalize({
                navigate: () => {
                    setReadyToFinish(true);
                },
            });
        }
    };

    const isVerificationStep =
        signUp.status === "missing_requirements" &&
        signUp.unverifiedFields.includes("email_address") &&
        signUp.missingFields.length === 0;

    // Email verification step
    if (isVerificationStep) {
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
                                    We sent a 6-digit code to{"\n"}{emailAddress.trim()}
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
                                            {isLoading ? "Verifying…" : "Verify email"}
                                        </Text>
                                    </Pressable>

                                    <Pressable
                                        className="auth-secondary-button"
                                        onPress={() => signUp.verifications.sendEmailCode()}
                                        disabled={isLoading}
                                    >
                                        <Text className="auth-secondary-button-text">Resend code</Text>
                                    </Pressable>
                                </View>
                            </View>

                            <View className="auth-link-row">
                                <Pressable
                                    onPress={() => {
                                        setCode("");
                                        setEmailAddress("");
                                        setPassword("");
                                        setUsername("");
                                        setAvatarUri(null);
                                    }}
                                >
                                    <Text className="auth-link">Use a different email</Text>
                                </Pressable>
                            </View>
                        </View>
                    </ScrollView>
                </KeyboardAvoidingView>
            </SafeAreaView>
        );
    }

    // Main sign-up form
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
                            <Text className="auth-title">Get started</Text>
                            <Text className="auth-subtitle">
                                Create your account and start tracking smarter
                            </Text>
                        </View>

                        <View className="auth-card">
                            {/* Avatar picker */}
                            <View className="items-center mb-4">
                                <Pressable onPress={pickImage}>
                                    {avatarUri ? (
                                        <Image
                                            source={{uri: avatarUri}}
                                            style={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: 40,
                                            }}
                                        />
                                    ) : (
                                        <View
                                            style={{
                                                width: 80,
                                                height: 80,
                                                borderRadius: 40,
                                                borderWidth: 2,
                                                borderStyle: "dashed",
                                                borderColor: "rgba(0,0,0,0.15)",
                                                alignItems: "center",
                                                justifyContent: "center",
                                                backgroundColor: "#f6eecf",
                                            }}
                                        >
                                            <Text style={{fontSize: 28, color: "rgba(0,0,0,0.25)"}}>+</Text>
                                        </View>
                                    )}
                                </Pressable>
                                <Text className="auth-helper mt-2">
                                    {avatarUri ? "Tap to change photo" : "Add profile photo (optional)"}
                                </Text>
                            </View>

                            <View className="auth-form">
                                <View className="auth-field">
                                    <Text className="auth-label">Username</Text>
                                    <TextInput
                                        className={`auth-input${errors.fields.username ? " auth-input-error" : ""}`}
                                        value={username}
                                        onChangeText={setUsername}
                                        placeholder="Choose a username"
                                        placeholderTextColor="rgba(0,0,0,0.35)"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    {errors.fields.username ? (
                                        <Text className="auth-error">
                                            {errors.fields.username.message}
                                        </Text>
                                    ) : (
                                        <Text className="auth-helper">At least 3 characters</Text>
                                    )}
                                </View>

                                <View className="auth-field">
                                    <Text className="auth-label">Email</Text>
                                    <TextInput
                                        className={`auth-input${errors.fields.emailAddress ? " auth-input-error" : ""}`}
                                        value={emailAddress}
                                        onChangeText={setEmailAddress}
                                        placeholder="Enter your email"
                                        placeholderTextColor="rgba(0,0,0,0.35)"
                                        keyboardType="email-address"
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                    />
                                    {errors.fields.emailAddress && (
                                        <Text className="auth-error">
                                            {errors.fields.emailAddress.message}
                                        </Text>
                                    )}
                                </View>

                                <View className="auth-field">
                                    <Text className="auth-label">Password</Text>
                                    <TextInput
                                        className={`auth-input${errors.fields.password ? " auth-input-error" : ""}`}
                                        value={password}
                                        onChangeText={setPassword}
                                        placeholder="Create a password"
                                        placeholderTextColor="rgba(0,0,0,0.35)"
                                        secureTextEntry
                                    />
                                    {errors.fields.password ? (
                                        <Text className="auth-error">
                                            {errors.fields.password.message}
                                        </Text>
                                    ) : (
                                        <Text className="auth-helper">Minimum 8 characters</Text>
                                    )}
                                </View>

                                <Pressable
                                    className={`auth-button${!canSubmit ? " auth-button-disabled" : ""}`}
                                    onPress={handleSignUp}
                                    disabled={!canSubmit}
                                >
                                    <Text className="auth-button-text">
                                        {isLoading ? "Creating account…" : "Create account"}
                                    </Text>
                                </Pressable>

                                <View className="auth-link-row">
                                    <Text className="auth-link-copy">Already have an account?</Text>
                                    <Link href="/sign-in">
                                        <Text className="auth-link">Sign in</Text>
                                    </Link>
                                </View>
                            </View>
                        </View>

                        {/* Required for Clerk bot protection */}
                        <View nativeID="clerk-captcha"/>
                    </View>
                </ScrollView>
            </KeyboardAvoidingView>
        </SafeAreaView>
    );
}
