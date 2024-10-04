import { Octicons } from "@expo/vector-icons"
import { StyleSheet, Text, TextInput, View } from "react-native"
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from "react-native-responsive-screen";

export function FormTextField({ icon, placeholder, errors = [], ...rest }) {
    return (
        <>
        <View style={{ height: hp(7) }} className="flex-row px-4 bg-neutral-100 items-center rounded-xl mb-2">
            {icon && (
                <Octicons name={icon} size={hp(2.7)} color="gray" />
            )}
            <TextInput 
                className="flex-1 font-semibold text-neutral-700 ml-3"
                placeholder={placeholder}
                placeholderTextColor={'gray'}
                style={styles.textInput}
                autoCapitalize="none"
                {...rest}
            />
        </View>

        {errors?.length > 0 && (
            <View style={styles.errorContainer}>
                {errors.map((err) => (
                    <Text className="text-right mb-2" key={err} style={styles.error}>{err}</Text>
                ))}
            </View>
        )}
        </>
    )
}

const styles = StyleSheet.create({
    label: {
        color: "#334155",
        fontWeight: "500"
    },
    textInput: {
        fontSize: hp(2)
    },
    error: {
        color: "red",
        marginTop: 2
    },
    errorContainer: {
        marginTop: 2, // Add some margin between the input and error message
    },
})