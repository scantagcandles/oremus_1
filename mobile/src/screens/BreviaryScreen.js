// mobile/src/screens/BreviaryScreen.js
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  ActivityIndicator,
  Modal,
  Alert
} from 'react-native';
import { supabase } from '../services/supabase';

export default function BreviaryScreen({ navigation }) {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [breviaryHours, setBreviaryHours] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedHour, setSelectedHour] = useState(null);
  const [showPrayerModal, setShowPrayerModal] = useState(false);
  const [currentPrayer, setCurrentPrayer] = useState(null);
  const [prayerProgress, setPrayerProgress] = useState({});
  const [currentSection, setCurrentSection] = useState(0);

  useEffect(() => {
    fetchBreviaryData();
    checkUserProgress();
  }, [selectedDate]);

  const fetchBreviaryData = async () => {
    try {
      setLoading(true);
      
      const { data: hours, error } = await supabase
        .from('breviary_hours')
        .select('*')
        .order('order_index');

      if (error) throw error;
      
      setBreviaryHours(hours || getDefaultHours());
    } catch (error) {
      console.error('Error fetching breviary:', error);
      setBreviaryHours(getDefaultHours());
    } finally {
      setLoading(false);
    }
  };

  const getDefaultHours = () => [
    { id: 1, name: 'Godzina czytań', typical_time: '06:00', icon: '📖', order_index: 1 },
    { id: 2, name: 'Jutrznia', typical_time: '07:00', icon: '🌅', order_index: 2 },
    { id: 3, name: 'Modlitwa przedpołudniowa', typical_time: '09:00', icon: '☀️', order_index: 3 },
    { id: 4, name: 'Modlitwa południowa', typical_time: '12:00', icon: '🕐', order_index: 4 },
    { id: 5, name: 'Modlitwa popołudniowa', typical_time: '15:00', icon: '🌤️', order_index: 5 },
    { id: 6, name: 'Nieszpory', typical_time: '18:00', icon: '🌆', order_index: 6 },
    { id: 7, name: 'Kompleta', typical_time: '21:00', icon: '🌙', order_index: 7 },
  ];

  const checkUserProgress = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const dateString = selectedDate.toISOString().split('T')[0];
      
      const { data } = await supabase
        .from('user_breviary_history')
        .select('hour_id')
        .eq('user_id', user.id)
        .eq('date', dateString);

      const progress = {};
      data?.forEach(item => {
        progress[item.hour_id] = true;
      });
      setPrayerProgress(progress);
    } catch (error) {
      console.error('Error checking progress:', error);
    }
  };

  const startPrayer = (hour) => {
    setSelectedHour(hour);
    setCurrentPrayer(getDefaultPrayer(hour));
    setCurrentSection(0);
    setShowPrayerModal(true);
  };

  const getDefaultPrayer = (hour) => {
    const defaults = {
      'Jutrznia': {
        sections: [
          {
            title: 'Wezwanie',
            content: 'Panie, otwórz wargi moje.\nA usta moje będą głosić Twoją chwałę.\n\nBóg, wejrzyj ku wspomożeniu memu.\nPanie, pośpiesz ku ratunkowi memu.\n\nChwała Ojcu i Synowi, i Duchowi Świętemu.\nJako była na początku, teraz i zawsze, i na wieki wieków. Amen.'
          },
          {
            title: 'Hymn',
            content: 'Kiedy ranne wstają zorze,\nWielbimy Ciebie, Boże,\nZa noc, która już minęła,\nZa dzień, który się zaczyna.\n\nNiech Twoja łaska nas prowadzi,\nNiech nasze serca się nie błądzą,\nAbyśmy w tym dniu codziennym\nCzynili wolę Twoją świętą.'
          },
          {
            title: 'Psalm 95',
            content: 'Przyjdźcie, radośnie śpiewajmy Panu,\nwznośmy okrzyki ku chwale Skały naszego zbawienia!\nStańmy przed Jego obliczem z dziękczynieniem\ni wykrzykujmy Mu psalmy!\n\nBo wielkim Bogiem jest Pan\ni Królem wielkim nad wszystkich bogów.\nW Jego ręku są głębiny ziemi\ni do Niego należą szczyty gór.\n\nJego jest morze, bo On je stworzył,\ni ląd ukształtowały Jego ręce.\nPrzyjdźcie, oddajmy Mu pokłon i cześć,\nupadnijmy na kolana przed Panem, naszym Stwórcą!'
          },
          {
            title: 'Kantyk Zachariasza',
            content: 'Błogosławiony Pan, Bóg Izraela,\nże nawiedził i wyzwolił lud swój.\nI wzbudził nam potężnego Zbawiciela\nw domu Dawida, sługi swego.\n\nJak zapowiedział przez usta świętych,\nod wieków swoich proroków:\nżeby nas wybawił od nieprzyjaciół\ni z rąk wszystkich, którzy nas nienawidzą.\n\nA nam da służyć Mu bez lęku,\nw świętości i sprawiedliwości przed Nim\nwszystkie dni nasze.'
          },
          {
            title: 'Modlitwa końcowa',
            content: 'Boże, Ty sprawiłeś, że dożyliśmy dnia dzisiejszego,\nspraw, abyśmy przeżyli go godnie.\nPomóż nam we wszystkich dzisiejszych sprawach\ni chroń nas od wszelkiego zła.\nPrzez Chrystusa, Pana naszego.\nAmen.'
          }
        ]
      },
      'Nieszpory': {
        sections: [
          {
            title: 'Wezwanie',
            content: 'Boże, wejrzyj ku wspomożeniu memu.\nPanie, pośpiesz ku ratunkowi memu.\n\nChwała Ojcu i Synowi, i Duchowi Świętemu.\nJako była na początku, teraz i zawsze, i na wieki wieków. Amen.'
          },
          {
            title: 'Hymn',
            content: 'Już dzień się kończy, Panie,\nI noc nadchodzi znów.\nPrzyjmij nasze dziękowanie\nZa wszystkie łaski Twoje.\n\nNiech anioł Twój nas strzeże\nW godzinach nocnej ciszy,\nAż poranek nowy wzejdzie\nI do Ciebie nas przybliży.'
          },
          {
            title: 'Psalm 121',
            content: 'Wznoszę oczy moje ku górom:\nSkądże nadejdzie mi pomoc?\nPomoc nadejdzie mi od Pana,\nktóry stworzył niebo i ziemię.\n\nNie pozwoli, aby zachwiała się twoja noga,\nnie zaśnie Ten, który cię strzeże.\nOto nie śpi ani nie drzemie\nStróż Izraela.\n\nPan jest twoim stróżem,\nPan osłoną twoją po prawej ręce.\nW dzień słońce cię nie porazi,\nani księżyc w nocy.\n\nPan będzie cię strzegł od wszelkiego zła,\nbędzie strzegł życia twego.\nPan będzie strzegł twego wyjścia i przyjścia\nod tej chwili aż na wieki.'
          },
          {
            title: 'Kantyk Maryi',
            content: 'Wielbi dusza moja Pana\ni raduje się duch mój w Bogu, Zbawcy moim.\nBo wejrzał na uniżenie służebnicy swojej.\nOto bowiem odtąd błogosławić mnie będą wszystkie pokolenia.\n\nBo wielkie rzeczy uczynił mi Wszechmocny,\na święte jest Jego imię.\nA Jego miłosierdzie z pokolenia na pokolenie\nnad tymi, którzy się Go boją.'
          },
          {
            title: 'Modlitwa końcowa',
            content: 'Boże, źródło światła, Ty posłałeś na świat swojego Syna,\nświatłość prawdziwą, ześlij na nas Ducha Świętego,\nktóry wprowadzi nas w całą prawdę.\nPrzez Chrystusa, Pana naszego.\nAmen.'
          }
        ]
      },
      'Kompleta': {
        sections: [
          {
            title: 'Wezwanie',
            content: 'Boże, wejrzyj ku wspomożeniu memu.\nPanie, pośpiesz ku ratunkowi memu.\n\nChwała Ojcu i Synowi, i Duchowi Świętemu.\nJako była na początku, teraz i zawsze, i na wieki wieków. Amen.'
          },
          {
            title: 'Hymn',
            content: 'Przed nocnym spoczynkiem\nProsimy Cię, Panie:\nCzuwaj nad nami\nI chroń nas od złego.\n\nNiech sen nam przyniesie\nPokój i odpoczynek,\nA rano obudzimy się\nDo nowego dnia z Tobą.'
          },
          {
            title: 'Psalm 91',
            content: 'Kto przebywa w pieczy Najwyższego\ni w cieniu Wszechmocnego mieszka,\nniech powie do Pana: "Ucieczko moja i twierdzo moja,\nBoże mój, w którym pokładam nadzieję!"\n\nOn wyrwie cię z sidła ptasznika\ni od zarazy zgubnej.\nSwoimi piórami osłoni cię\ni pod Jego skrzydłami znajdziesz schronienie.\n\nNie będziesz się lękał strachu nocnego\nani strzały lecącej we dnie,\nani zarazy, która się skrada w mroku,\nani pomoru, który pustoszy w południe.'
          },
          {
            title: 'Kantyk Symeona',
            content: 'Teraz pozwalasz odejść słudze swemu, Władco,\nwedług słowa Twego w pokoju.\nBo ujrzały oczy moje Twoje zbawienie,\nktóre przygotowałeś wobec wszystkich narodów:\nświatłość na oświecenie pogan\ni chwałę ludu Twego, Izraela.'
          },
          {
            title: 'Modlitwa końcowa',
            content: 'Nawiedzaj, prosimy Cię, Panie, to mieszkanie\ni oddal od niego wszelkie zasadzki nieprzyjaciela;\nniech w nim mieszkają Twoi święci Aniołowie,\naby nas strzegli w pokoju,\na Twoje błogosławieństwo niech będzie zawsze z nami.\nPrzez Chrystusa, Pana naszego. Amen.'
          }
        ]
      }
    };

    return defaults[hour.name] || {
      sections: [
        {
          title: 'Wezwanie',
          content: 'Boże, wejrzyj ku wspomożeniu memu.\nPanie, pośpiesz ku ratunkowi memu.'
        },
        {
          title: 'Modlitwa',
          content: 'Panie Jezu Chryste, bądź z nami\nw tej godzinie modlitwy.\nNaplń nasze serca Twoją miłością\ni prowadź nas drogą świętości.\nAmen.'
        }
      ]
    };
  };

  const completePrayer = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        Alert.alert('Sukces! 🙏', 'Modlitwa zakończona. Dziękujemy za wspólną modlitwę!');
        setShowPrayerModal(false);
        return;
      }

      const dateString = selectedDate.toISOString().split('T')[0];
      
      await supabase
        .from('user_breviary_history')
        .insert({
          user_id: user.id,
          date: dateString,
          hour_id: selectedHour.id,
          duration_seconds: 300
        });

      setPrayerProgress(prev => ({
        ...prev,
        [selectedHour.id]: true
      }));

      Alert.alert('Modlitwa zakończona! 🙏', 'Dziękujemy za wspólną modlitwę brewiarza!');
      setShowPrayerModal(false);
    } catch (error) {
      console.error('Error saving prayer:', error);
      Alert.alert('Modlitwa zakończona! 🙏', 'Dziękujemy za wspólną modlitwę!');
      setShowPrayerModal(false);
    }
  };

  const nextSection = () => {
    if (currentPrayer && currentSection < currentPrayer.sections.length - 1) {
      setCurrentSection(currentSection + 1);
    } else {
      completePrayer();
    }
  };

  const prevSection = () => {
    if (currentSection > 0) {
      setCurrentSection(currentSection - 1);
    }
  };

  const changeDate = (days) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
  };

  const renderHourCard = (hour) => {
    const isPrayed = prayerProgress[hour.id];
    const currentTime = new Date();
    const [hourTime, minuteTime] = hour.typical_time.split(':');
    const scheduledTime = new Date();
    scheduledTime.setHours(parseInt(hourTime), parseInt(minuteTime), 0);
    
    const isCurrentHour = Math.abs(currentTime - scheduledTime) < 3600000; // 1 godzina

    return (
      <TouchableOpacity
        key={hour.id}
        style={[
          styles.hourCard,
          isCurrentHour && styles.hourCardActive,
          isPrayed && styles.hourCardCompleted
        ]}
        onPress={() => startPrayer(hour)}
      >
        <View style={styles.hourHeader}>
          <Text style={styles.hourIcon}>{hour.icon}</Text>
          <View style={styles.hourInfo}>
            <Text style={styles.hourName}>{hour.name}</Text>
            <Text style={styles.hourTime}>{hour.typical_time}</Text>
          </View>
          {isPrayed && <Text style={styles.checkmark}>✓</Text>}
          {isCurrentHour && !isPrayed && <Text style={styles.currentIndicator}>●</Text>}
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text style={styles.backButton}>← Powrót</Text>
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Brewiarz</Text>
      </View>

      <View style={styles.dateSelector}>
        <TouchableOpacity onPress={() => changeDate(-1)}>
          <Text style={styles.dateArrow}>‹</Text>
        </TouchableOpacity>
        
        <View style={styles.dateInfo}>
          <Text style={styles.dateText}>
            {selectedDate.toLocaleDateString('pl-PL', { 
              weekday: 'long', 
              day: 'numeric', 
              month: 'long' 
            })}
          </Text>
        </View>
        
        <TouchableOpacity onPress={() => changeDate(1)}>
          <Text style={styles.dateArrow}>›</Text>
        </TouchableOpacity>
      </View>

      {loading ? (
        <ActivityIndicator size="large" color="#FFD700" style={styles.loader} />
      ) : (
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          <View style={styles.progressSection}>
            <Text style={styles.progressText}>
              Odmówione: {Object.keys(prayerProgress).length} z {breviaryHours.length}
            </Text>
            <View style={styles.progressBar}>
              <View 
                style={[
                  styles.progressFill,
                  { width: `${(Object.keys(prayerProgress).length / breviaryHours.length) * 100}%` }
                ]}
              />
            </View>
          </View>

          <View style={styles.hoursGrid}>
            {breviaryHours.map(hour => renderHourCard(hour))}
          </View>

          <View style={styles.infoSection}>
            <Text style={styles.infoTitle}>O brewiarzu</Text>
            <Text style={styles.infoText}>
              Brewiarz to modlitwa oficjalna Kościoła, nazywana też Liturgią Godzin. 
              Składa się z siedmiu głównych modlitw rozłożonych w ciągu dnia, 
              które pomagają uświęcić wszystkie godziny dnia.
            </Text>
          </View>

          <TouchableOpacity style={styles.guideButton}>
            <Text style={styles.guideIcon}>📚</Text>
            <Text style={styles.guideText}>Przewodnik po brewiarzu</Text>
          </TouchableOpacity>
        </ScrollView>
      )}

      {/* Modal modlitwy */}
      <Modal
        visible={showPrayerModal}
        animationType="slide"
        onRequestClose={() => setShowPrayerModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={() => setShowPrayerModal(false)}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedHour?.name}</Text>
            <View style={styles.placeholder} />
          </View>

          {currentPrayer && (
            <ScrollView style={styles.modalContent}>
              <Text style={styles.sectionTitle}>
                {currentPrayer.sections[currentSection]?.title}
              </Text>
              <Text style={styles.prayerText}>
                {currentPrayer.sections[currentSection]?.content}
              </Text>
            </ScrollView>
          )}

          <View style={styles.modalFooter}>
            <TouchableOpacity 
              onPress={prevSection}
              disabled={currentSection === 0}
              style={[styles.navButton, currentSection === 0 && styles.navButtonDisabled]}
            >
              <Text style={styles.navButtonText}>← Wstecz</Text>
            </TouchableOpacity>

            <View style={styles.sectionIndicator}>
              {currentPrayer?.sections.map((_, index) => (
                <View
                  key={index}
                  style={[
                    styles.dot,
                    index === currentSection && styles.dotActive
                  ]}
                />
              ))}
            </View>

            <TouchableOpacity onPress={nextSection} style={styles.navButton}>
              <Text style={styles.navButtonText}>
                {currentPrayer && currentSection === currentPrayer.sections.length - 1 ? 'Zakończ' : 'Dalej →'}
              </Text>
            </TouchableOpacity>
          </View>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1a237e',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 20,
    paddingTop: 10,
  },
  backButton: {
    color: '#FFD700',
    fontSize: 16,
    marginRight: 20,
  },
  headerTitle: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
  },
  dateSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  dateArrow: {
    color: '#FFD700',
    fontSize: 30,
    paddingHorizontal: 15,
  },
  dateInfo: {
    alignItems: 'center',
  },
  dateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    padding: 20,
  },
  progressSection: {
    marginBottom: 20,
  },
  progressText: {
    color: '#fff',
    fontSize: 14,
    marginBottom: 10,
  },
  progressBar: {
    height: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFD700',
    borderRadius: 4,
  },
  hoursGrid: {
    gap: 15,
  },
  hourCard: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
  },
  hourCardActive: {
    backgroundColor: 'rgba(255, 215, 0, 0.2)',
    borderWidth: 1,
    borderColor: '#FFD700',
  },
  hourCardCompleted: {
    opacity: 0.7,
  },
  hourHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  hourIcon: {
    fontSize: 40,
    marginRight: 15,
  },
  hourInfo: {
    flex: 1,
  },
  hourName: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  hourTime: {
    color: '#FFD700',
    fontSize: 14,
    marginTop: 5,
  },
  checkmark: {
    color: '#4CAF50',
    fontSize: 24,
    fontWeight: 'bold',
  },
  currentIndicator: {
    color: '#FFD700',
    fontSize: 20,
  },
  infoSection: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
  },
  infoTitle: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
  },
  infoText: {
    color: '#fff',
    fontSize: 16,
    lineHeight: 24,
  },
  guideButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 15,
    padding: 20,
    marginTop: 20,
    marginBottom: 40,
  },
  guideIcon: {
    fontSize: 30,
    marginRight: 10,
  },
  guideText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#1a237e',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  closeButton: {
    color: '#FFD700',
    fontSize: 30,
  },
  modalTitle: {
    color: '#FFD700',
    fontSize: 20,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 30,
  },
  modalContent: {
    flex: 1,
    padding: 20,
  },
  sectionTitle: {
    color: '#FFD700',
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  prayerText: {
    color: '#fff',
    fontSize: 18,
    lineHeight: 28,
    textAlign: 'center',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
  },
  navButton: {
    padding: 15,
  },
  navButtonDisabled: {
    opacity: 0.3,
  },
  navButtonText: {
    color: '#FFD700',
    fontSize: 16,
    fontWeight: 'bold',
  },
  sectionIndicator: {
    flexDirection: 'row',
    gap: 8,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
  },
  dotActive: {
    backgroundColor: '#FFD700',
  },
});