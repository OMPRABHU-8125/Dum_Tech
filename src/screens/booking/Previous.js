import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Alert,
  TextInput
} from 'react-native';
import styles from './previous.styles';
import firestore from '@react-native-firebase/firestore';
import { useAppSelector } from '../../../store/hook';
import LinearGradient from 'react-native-linear-gradient';
import Icons from 'react-native-vector-icons/MaterialIcons';

const HorizontalLine = () => {
  return <View style={styles.line} />;
};

const Previous = ({ route }) => {
  const [documents, setDocuments] = useState([]);
  const [isElapsedExpanded, setIsElapsedExpanded] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const user = useAppSelector((state) => state.profile.data);

  const fetchUserBookings = async () => {
    try {
      const fetchedUserBookings = [];

      const snapshot = await firestore().collection('Booking').get();

      if (snapshot.empty) {
        console.log('No documents found.');
        return;
      }

      snapshot.forEach((doc) => {
        const bookingData = doc.data();
        const filteredBookings = bookingData.bookings.filter(
          (booking) => booking.bookedBy === user.email
        );

        if (filteredBookings.length > 0) {
          fetchedUserBookings.push({
            id: doc.id,
            ...bookingData,
            bookings: filteredBookings,
          });
        }
      });

      fetchedUserBookings.forEach((booking) => {
        booking.bookings.sort((a, b) => {
          return a.date.toDate() - b.date.toDate();
        });
      });

      setDocuments(fetchedUserBookings);
    } catch (error) {
      console.error('Error fetching user bookings:', error);
    }
  };

  useEffect(() => {
    fetchUserBookings();
  }, [user.email]);

  const deleteBooking = async (documentId, bookingToDelete) => {
    const docRef = firestore().collection('Booking').doc(documentId);

    try {
      const doc = await docRef.get();

      if (doc.exists) {
        let bookingsArray = doc.data().bookings || [];

        const indexToDelete = bookingsArray.findIndex(
          (booking) => booking.bookingId === bookingToDelete.bookingId
        );

        if (indexToDelete !== -1) {
          const bookingDate = bookingToDelete.bookedOn.toDate();
          const currentDate = new Date();
          const timeDifference = currentDate.getTime() - bookingDate.getTime();
          const daysDifference = timeDifference / (1000 * 3600 * 24);

          if (daysDifference > 2) {
            Alert.alert(
              'Cannot Cancel Booking',
              'You cannot cancel a booking made more than 2 days ago.'
            );
          } else {
            Alert.alert(
              'Cancel Booking',
              'Are you sure you want to cancel this booking?',
              [
                {
                  text: 'Cancel',
                  style: 'cancel',
                },
                {
                  text: 'OK',
                  onPress: async () => {
                    bookingsArray.splice(indexToDelete, 1);
                    await docRef.update({
                      bookings: bookingsArray,
                    });
                    await fetchUserBookings();
                    Alert.alert(
                      'Booking Canceled',
                      'Your booking has been canceled successfully.'
                    );
                  },
                },
              ],
              { cancelable: false }
            );
          }
        } else {
          console.log('Booking not found.');
        }
      } else {
        console.log('Document does not exist.');
      }
    } catch (error) {
      console.error('Error deleting booking:', error);
    }
  };

  const dateOptions = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  };

  const timeOptions = {
    hour: '2-digit',
    minute: '2-digit',
  };

  const currentDate = new Date();
  const toggleElapsedExpand = () => {
    setIsElapsedExpanded(!isElapsedExpanded);
  };

  const handleSearch = () => {
    const filteredDocuments = documents.map((booking) => {
      return {
        ...booking,
        bookings: booking.bookings.filter((individual) => {
          const bookingIdLowerCase = individual.bookingId
            ? individual.bookingId.toLowerCase()
            : '';
          const searchQueryLowerCase = searchQuery.toLowerCase();
          return (
            bookingIdLowerCase.includes(searchQueryLowerCase) ||
            individual.bookingId.includes(searchQuery)
          );
        }),
      };
    });

    setDocuments(filteredDocuments);
  };

  const handleTextChange = (text) => {
    setSearchQuery(text);
    if (!text) {
      fetchUserBookings();
    } else {
      handleSearch();
    }
  };

  return (
    <ScrollView style={{ margin: 1 }}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search by Booking ID"
        value={searchQuery}
        onChangeText={(text) => { handleTextChange(text) }}
      />
      {documents.map((booking) => (
        booking.bookings.map((individual) => (
          <View key={individual.id}>
            {currentDate < individual.date.toDate() && (
              <View key={individual.id} style={styles.card}>
                <LinearGradient
                  colors={['#EFBF38', '#F5DE7A']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ ...styles.gradient }}
                >
                  <View>
                    <View style={styles.textContainer}>
                      <Text style={styles.text}>Booked By: </Text>
                      <Text style={styles.record}>{user.firstName} {user.lastName}</Text>
                      <TouchableOpacity
                        style={styles.icon}
                        onPress={() => deleteBooking(booking.id, individual)}
                      >
                        <Icons name='delete' size={25} color='black' />
                      </TouchableOpacity>
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.text}>Venue: </Text>
                      <Text style={styles.record}>{booking.name}</Text>
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.text}>Date: </Text>
                      <Text style={styles.record}>
                        {individual.date
                          .toDate()
                          .toLocaleString('en-US', dateOptions)}
                      </Text>
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.text}>Time: </Text>
                      <Text style={[styles.record, { color: '#228B22' }]}>
                        {individual.time.startTime
                          .toDate()
                          .toLocaleString('en-US', timeOptions)}-{' '}
                        {individual.time.endTime
                          .toDate()
                          .toLocaleString('en-US', timeOptions)}
                      </Text>
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.text}>Booking Id: </Text>
                      <Text style={styles.record}>{individual.bookingId}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            )}
          </View>
        ))
      ))}

      <HorizontalLine />
      <TouchableOpacity onPress={toggleElapsedExpand}>
        <View style={styles.container}>
          <Text style={styles.header}>Elapsed</Text>
          <Text style={styles.header}>{isElapsedExpanded ? '-' : '+'}</Text>
        </View>
      </TouchableOpacity>
      {isElapsedExpanded && documents.map((booking) => (
        booking.bookings.map((individual) => (
          <View key={individual.id}>
            {currentDate >= individual.date.toDate() && (
              <View key={individual.id} style={styles.card}>
                <LinearGradient
                  colors={['#DDDDDD', '#CCCCCC']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={{ ...styles.gradient }}
                >
                  <View>
                    <View style={styles.textContainer}>
                      <Text style={styles.text}>Booked By: </Text>
                      <Text style={styles.record}>{user.firstName} {user.lastName}</Text>
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.text}>Venue: </Text>
                      <Text style={styles.record}>{booking.name}</Text>
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.text}>Date: </Text>
                      <Text style={styles.record}>
                        {individual.date
                          .toDate()
                          .toLocaleString('en-US', dateOptions)}
                      </Text>
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.text}>Time: </Text>
                      <Text style={[styles.record, { color: '#228B22' }]}>
                        {individual.time.startTime
                          .toDate()
                          .toLocaleString('en-US', timeOptions)}-{' '}
                        {individual.time.endTime
                          .toDate()
                          .toLocaleString('en-US', timeOptions)}
                      </Text>
                    </View>
                    <View style={styles.textContainer}>
                      <Text style={styles.text}>Booking Id: </Text>
                      <Text style={styles.record}>{individual.bookingId}</Text>
                    </View>
                  </View>
                </LinearGradient>
              </View>
            )}
          </View>
        ))
      ))}
    </ScrollView>
  )
};

export default Previous;