const Symptoms = [
    { id: 1, name: 'Headache', colour: '#b87a7b' },
    { id: 2, name: 'Nosebleed', colour: '#7a80b8' },
    { id: 3, name: 'Lethargy', colour: '#7ab88a' },
    { id: 4, name: 'Wisdom', colour: '#b7b87a' }
  ];
  
  const SymptomInstances = [
    { id: 1, typeId: 1, date: '2021-01-06', startTime: '11:40', endTime: '15:05', severity: '30' },
    { id: 2, typeId: 2, date: '2021-01-11', startTime: '19:00', endTime: '19:25', severity: '69' },
    { id: 3, typeId: 3, date: '2021-01-18', startTime: '01:30', endTime: '07:00', severity: '45' },
    { id: 4, typeId: 4, date: '2021-01-29', startTime: '12:40', endTime: '12:55', severity: '78' },
    { id: 5, typeId: 2, date: '2021-01-04', startTime: '21:00', endTime: '22:25', severity: '12' },
    { id: 6, typeId: 2, date: '2021-01-12', startTime: '14:30', endTime: '21:00', severity: '28' },
    { id: 7, typeId: 4, date: '2021-01-02', startTime: '11:40', endTime: '15:05', severity: '30' },
    { id: 8, typeId: 3, date: '2021-01-21', startTime: '19:00', endTime: '19:25', severity: '69' },
    { id: 9, typeId: 3, date: '2021-01-26', startTime: '01:30', endTime: '07:00', severity: '45' },
    { id: 10, typeId: 1, date: '2021-01-09', startTime: '12:40', endTime: '12:55', severity: '78' },
    { id: 11, typeId: 1, date: '2021-01-19', startTime: '21:00', endTime: '22:25', severity: '12' },
    { id: 12, typeId: 3, date: '2021-01-01', startTime: '14:30', endTime: '23:00', severity: '28' },
    { id: 13, typeId: 1, date: '2021-02-06', startTime: '11:40', endTime: '15:05', severity: '30' },
    { id: 14, typeId: 2, date: '2021-02-11', startTime: '19:00', endTime: '19:25', severity: '69' },
    { id: 15, typeId: 4, date: '2021-02-18', startTime: '01:30', endTime: '07:00', severity: '45' },
    { id: 17, typeId: 2, date: '2021-02-04', startTime: '21:00', endTime: '22:25', severity: '12' },
    { id: 18, typeId: 4, date: '2021-02-12', startTime: '14:30', endTime: '22:00', severity: '28' },
    { id: 16, typeId: 1, date: '2021-03-01', startTime: '12:40', endTime: '12:55', severity: '78' }
  ]


  this.props.navigation.addListener('beforeRemove', (e) => {
    let symptom = this.state.Symptom;
    let origin = this.state.origin;
    if (symptom.name === origin.name && symptom.colour === origin.colour) {
      return;
    }

    e.preventDefault();

    Alert.alert(
      'Discard changes?',
      'You have unsaved changes.',
      [
        { text: "Don't leave", style: 'cancel', onPress: () => {} },
        {
          text: 'Discard',
          style: 'destructive',
          onPress: () => {
            this.resetFields();
            this.props.navigation.dispatch(e.data.action);
          },
        },
      ]
    );
  });