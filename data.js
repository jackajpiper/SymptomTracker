const Symptoms = [
    { id: 1, name: 'Headache', colour: '#b87a7b' },
    { id: 2, name: 'Nosebleed', colour: '#7a80b8' },
    { id: 3, name: 'Lethargy', colour: '#7ab88a' },
    { id: 4, name: 'Wisdom', colour: '#b7b87a' }
  ];
  
const SymptomInstances = [
  { id: 1, typeId: 1, date: '2021-01-06', startTime: '11:40', endTime: '15:05', severity: 30, notes: 'note1' },
  { id: 2, typeId: 2, date: '2021-01-11', startTime: '19:00', endTime: '19:25', severity: 69, notes: 'note2' },
  { id: 3, typeId: 3, date: '2021-01-18', startTime: '01:30', endTime: '07:00', severity: 45, notes: 'note3' },
  { id: 4, typeId: 4, date: '2021-01-29', startTime: '12:40', endTime: '12:55', severity: 78, notes: 'note4' },
  { id: 5, typeId: 2, date: '2021-01-04', startTime: '21:00', endTime: '22:25', severity: 12, notes: 'note5' },
  { id: 6, typeId: 2, date: '2021-01-12', startTime: '14:30', endTime: '21:00', severity: 28, notes: 'note6' },
  { id: 7, typeId: 4, date: '2021-01-02', startTime: '11:40', endTime: '15:05', severity: 30, notes: 'note7' },
  { id: 8, typeId: 3, date: '2021-01-21', startTime: '19:00', endTime: '19:25', severity: 69, notes: 'note8' },
  { id: 9, typeId: 3, date: '2021-01-26', startTime: '01:30', endTime: '07:00', severity: 45, notes: 'note9' },
  { id: 10, typeId: 1, date: '2021-01-09', startTime: '12:40', endTime: '12:55', severity: 78, notes: 'note10' },
  { id: 11, typeId: 1, date: '2021-01-19', startTime: '21:00', endTime: '22:25', severity: 12, notes: 'note11' },
  { id: 12, typeId: 3, date: '2021-01-01', startTime: '14:30', endTime: '23:00', severity: 28, notes: 'note12' },
  { id: 13, typeId: 1, date: '2021-02-06', startTime: '11:40', endTime: '15:05', severity: 30, notes: 'note13' },
  { id: 14, typeId: 2, date: '2021-02-11', startTime: '19:00', endTime: '19:25', severity: 69, notes: 'note14' },
  { id: 15, typeId: 4, date: '2021-02-18', startTime: '01:30', endTime: '07:00', severity: 45, notes: 'note15' },
  { id: 17, typeId: 2, date: '2021-02-04', startTime: '21:00', endTime: '22:25', severity: 12, notes: 'note16' },
  { id: 18, typeId: 4, date: '2021-02-12', startTime: '14:30', endTime: '22:00', severity: 28, notes: 'note17' },
  { id: 16, typeId: 1, date: '2021-03-01', startTime: '12:40', endTime: '12:55', severity: 78, notes: 'note18' }
]

const TreatmentInstances = [
  { id: 1, typeId: 4, date: '2021-02-18', startTime: '02:30', endTime: '07:00', notes: 'note1' },
  { id: 2, typeId: 2, date: '2021-02-11', startTime: '22:00', endTime: '22:25', notes: 'note2' },
  { id: 3, typeId: 3, date: '2021-02-12', startTime: '16:30', endTime: '22:00', notes: 'note3' },
  { id: 4, typeId: 1, date: '2021-03-01', startTime: '10:40', endTime: '12:55', notes: 'note4' }
]

const Treatments = [
  { id: 1, name: "Ibuprofen", colour: "#b87aa8", unitTypeId: 1, unit: "Pills"},
  { id: 1, name: "Cheese", colour: "#b5b87a", unit: "Grams"},
  { id: 1, name: "Sleep", colour: "#7a7bb8", unitTypeId: 2, unit: "Quality"},
  { id: 1, name: "Hugs", colour: "#b88e7a", unit: "Hugs"}
]

const TreatmentInstances = [
  { id: 1, typeId: 1, date: '2021-01-06', startTime: '11:40', endTime: '15:05', severity: 30, notes: 'note1' },
  { id: 2, typeId: 2, date: '2021-01-11', startTime: '19:00', endTime: '19:25', severity: 69, notes: 'note2' },
  { id: 3, typeId: 3, date: '2021-01-18', startTime: '01:30', endTime: '07:00', severity: 45, notes: 'note3' },
  { id: 4, typeId: 4, date: '2021-01-29', startTime: '12:40', endTime: '12:55', severity: 78, notes: 'note4' },
  { id: 5, typeId: 2, date: '2021-01-04', startTime: '21:00', endTime: '22:25', severity: 12, notes: 'note5' },
  { id: 6, typeId: 2, date: '2021-01-12', startTime: '14:30', endTime: '21:00', severity: 28, notes: 'note6' },
  { id: 7, typeId: 4, date: '2021-01-02', startTime: '11:40', endTime: '15:05', severity: 30, notes: 'note7' },
  { id: 8, typeId: 3, date: '2021-01-21', startTime: '19:00', endTime: '19:25', severity: 69, notes: 'note8' },
  { id: 9, typeId: 3, date: '2021-01-26', startTime: '01:30', endTime: '07:00', severity: 45, notes: 'note9' },
  { id: 10, typeId: 1, date: '2021-01-09', startTime: '12:40', endTime: '12:55', severity: 78, notes: 'note10' },
  { id: 11, typeId: 1, date: '2021-01-19', startTime: '21:00', endTime: '22:25', severity: 12, notes: 'note11' },
  { id: 12, typeId: 3, date: '2021-01-01', startTime: '14:30', endTime: '23:00', severity: 28, notes: 'note12' },
  { id: 13, typeId: 1, date: '2021-02-06', startTime: '11:40', endTime: '15:05', severity: 30, notes: 'note13' },
  { id: 14, typeId: 2, date: '2021-02-11', startTime: '19:00', endTime: '19:25', severity: 69, notes: 'note14' },
  { id: 15, typeId: 4, date: '2021-02-18', startTime: '01:30', endTime: '07:00', severity: 45, notes: 'note15' },
  { id: 17, typeId: 2, date: '2021-02-04', startTime: '21:00', endTime: '22:25', severity: 12, notes: 'note16' },
  { id: 18, typeId: 4, date: '2021-02-12', startTime: '14:30', endTime: '22:00', severity: 28, notes: 'note17' },
  { id: 16, typeId: 1, date: '2021-03-01', startTime: '12:40', endTime: '12:55', severity: 78, notes: 'note18' }
]

const DiaryData = [
  { date: "2021-03-12", text: "I had big shit in my trousers" },
  { date: "2021-03-13", text: "I had big shit in my trousers again" },
  { date: "2021-03-15", text: "I keep getting these absurdly huge shits inside my trousers" },
  { date: "2021-03-16", text: "It happened again." },
  { date: "2021-03-19", text: "I don't understand how it keeps happening.\n\n\n\n\n\n\nIt's like a bomb went off down there." },
  { date: "2021-03-21", text: "If only I could figure out...\n\n\n\n\n\nWhy I keep finding insane poo volumes in my downstairs clothing" },
  { date: "2021-03-22", text: "I\ndon't\nwant\nto\nkeep\nshitting\nmyself" },
  { date: "2021-03-23", text: "It was warm today." }
]

// TODO
//  -- make severity an optional attribute for symptoms
//    -- maybe expand the system to allow custom severity/dose tracking
//  -- do something with the analyse tab
//    -- allow the user to chart one symptom/treatment against another in a graph (probably scatter)
//    -- maybe provide some kind of calculated correlation score
//  -- make the title on the homepage more stylish
//  -- implement dark mode
//    -- follow that up by implementing themes
//  -- make a onboarding thing for new users
//  -- implement settings
//  -- implement the diary?


//  -- EXTESION IDEAS
//    -- Have a unit type and unit for each treatment
//      -- unit type "continuous" means a simple number field e.g num of pills taken
//      -- unit type "discrete" means a custom list of options, saved and presented as a dropdown
//      -- when the user saves an instance, they specify the dose using the unit provided as a label
//        -- to do so they would either enter a number or pick from a dropdown