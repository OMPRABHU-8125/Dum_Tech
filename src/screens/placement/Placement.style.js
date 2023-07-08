import {StyleSheet} from 'react-native';
import { black, blue, maroon, red, white, yellow } from '../../utils/color'

const styles = StyleSheet.create({
    container: {
        flexGrow: 1,
        alignItems: 'center',
        justifyContent: 'center',
    },
    content: {
        paddingHorizontal: 20,
        paddingBottom: 20,
        alignItems: 'center',
    },
    image: {
        width: 238,
        height: 300,
        marginBottom: 20,
    },
    coloredSection1: {
        backgroundColor: yellow,
        padding: 10,
        marginVertical: 10,
    },
    heading: {
        fontSize: 20,
        fontWeight: 'bold',
        alignSelf: 'center',
        marginTop: 10,
        marginBottom: 5,
        color: maroon,
    },
    section: {
        alignSelf: 'stretch',
        marginVertical: 10,
    },
    subHeading: {
       fontSize: 25,
        fontWeight: 'bold',
        marginBottom: 5,
        color: maroon,
    },
    contactText: {
        fontSize: 20,
        marginBottom: 5,
        color: blue,
        textDecorationLine: 'underline',
    },
    academicYear: {
        color: blue,
        textDecorationLine: 'underline',
        marginBottom: 8,
        fontSize: 20,
    },
    aboutText: {
        color: black,
        fontSize: 16,
        marginBottom: 10,
        
      },
});

export default styles;