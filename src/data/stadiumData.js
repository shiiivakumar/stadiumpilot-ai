// StadiumPilot AI - Stadium Data Configuration
// Defines coordinates, capacities, POIs, transit networks, and demo scenarios.

export const STADIUM_ZONES = {
  northGate: { id: 'northGate', name: 'North Gate', x: 400, y: 50, radius: 25, capacity: 15000, labelYOffset: -35 },
  southGate: { id: 'southGate', name: 'South Gate', x: 400, y: 750, radius: 25, capacity: 15000, labelYOffset: 35 },
  eastConcourse: { id: 'eastConcourse', name: 'East Concourse', x: 680, y: 400, radius: 30, capacity: 10000, labelYOffset: 0 },
  westConcourse: { id: 'westConcourse', name: 'West Concourse', x: 120, y: 400, radius: 30, capacity: 10000, labelYOffset: 0 },
  foodCourt: { id: 'foodCourt', name: 'Food Court', x: 400, y: 560, radius: 35, capacity: 8000, labelYOffset: 0 },
  metroExit: { id: 'metroExit', name: 'Metro Terminal A', x: 400, y: -80, radius: 20, capacity: 20000, labelYOffset: -25, isExternal: true },
  metroExitB: { id: 'metroExitB', name: 'Metro Terminal B', x: 400, y: 880, radius: 20, capacity: 20000, labelYOffset: 25, isExternal: true },
  parkingZone: { id: 'parkingZone', name: 'Parking Zone Alpha', x: 80, y: 80, radius: 30, capacity: 5000, labelYOffset: 0, isExternal: true },
  parkingZoneBeta: { id: 'parkingZoneBeta', name: 'Parking Zone Beta', x: 720, y: 80, radius: 30, capacity: 5000, labelYOffset: 0, isExternal: true },
  sectionA: { id: 'sectionA', name: 'Seating Section A', x: 400, y: 220, radius: 40, capacity: 8000, labelYOffset: 0 },
  sectionB: { id: 'sectionB', name: 'Seating Section B', x: 580, y: 400, radius: 45, capacity: 12000, labelYOffset: 0 },
  sectionC: { id: 'sectionC', name: 'Seating Section C', x: 220, y: 400, radius: 45, capacity: 12000, labelYOffset: 0 },
  sectionD: { id: 'sectionD', name: 'Seating Section D', x: 400, y: 400, radius: 60, capacity: 15000, labelYOffset: 0, nameExtra: 'Pitch Area' }
};

export const POINTS_OF_INTEREST = [
  { id: 'restroom_n', name: 'North Restrooms', type: 'restroom', zone: 'northGate', x: 340, y: 90, accessible: false },
  { id: 'restroom_acc_n', name: 'Accessible Restroom (North)', type: 'restroom_accessible', zone: 'northGate', x: 460, y: 90, accessible: true },
  { id: 'restroom_e', name: 'East Restrooms', type: 'restroom', zone: 'eastConcourse', x: 650, y: 340, accessible: false },
  { id: 'restroom_acc_e', name: 'Accessible Restroom (East)', type: 'restroom_accessible', zone: 'eastConcourse', x: 650, y: 460, accessible: true },
  { id: 'restroom_w', name: 'West Restrooms', type: 'restroom', zone: 'westConcourse', x: 150, y: 340, accessible: false },
  { id: 'restroom_acc_w', name: 'Accessible Restroom (West)', type: 'restroom_accessible', zone: 'westConcourse', x: 150, y: 460, accessible: true },
  { id: 'restroom_s', name: 'South Restrooms', type: 'restroom', zone: 'southGate', x: 340, y: 710, accessible: false },
  { id: 'restroom_acc_s', name: 'Accessible Restroom (South)', type: 'restroom_accessible', zone: 'southGate', x: 460, y: 710, accessible: true },
  
  { id: 'medical_n', name: 'North First Aid Station', type: 'medical', zone: 'northGate', x: 400, y: 110 },
  { id: 'medical_s', name: 'South First Aid Station', type: 'medical', zone: 'southGate', x: 400, y: 690 },
  
  { id: 'food_n', name: 'North Concessions', type: 'food', zone: 'northGate', x: 260, y: 130 },
  { id: 'food_e', name: 'East Concessions & Coffee', type: 'food', zone: 'eastConcourse', x: 610, y: 280 },
  { id: 'food_w', name: 'West Concessions & Burgers', type: 'food', zone: 'westConcourse', x: 190, y: 280 },
  { id: 'food_s', name: 'South Concessions', type: 'food', zone: 'southGate', x: 260, y: 670 },
  { id: 'food_court_hub', name: 'Main Food Court Center', type: 'food', zone: 'foodCourt', x: 400, y: 560 },

  { id: 'info_n', name: 'North Help Desk', type: 'info', zone: 'northGate', x: 400, y: 150 },
  { id: 'info_s', name: 'South Help Desk', type: 'info', zone: 'southGate', x: 400, y: 650 },
  
  { id: 'exit_north', name: 'Emergency Exit North', type: 'emergency_exit', zone: 'northGate', x: 400, y: 15 },
  { id: 'exit_south', name: 'Emergency Exit South', type: 'emergency_exit', zone: 'southGate', x: 400, y: 785 },
  { id: 'exit_east', name: 'Emergency Exit East', type: 'emergency_exit', zone: 'eastConcourse', x: 740, y: 400 },
  { id: 'exit_west', name: 'Emergency Exit West', type: 'emergency_exit', zone: 'westConcourse', x: 60, y: 400 }
];

export const TRANSIT_OPTIONS = {
  metroA: {
    id: 'metroA',
    name: 'Metro Terminal A',
    type: 'metro',
    location: 'North Concourse External',
    status: 'normal',
    crowdLevel: 'LOW',
    walkingTime: 5,
    walkingTimeAccessible: 8,
    cost: '$2.50',
    frequency: 'Every 4 mins',
    destinations: ['City Center', 'Main Station', 'Airport Express'],
    description: 'Fastest link to downtown. Elevators available at Gate 1.'
  },
  metroB: {
    id: 'metroB',
    name: 'Metro Terminal B',
    type: 'metro',
    location: 'South Concourse External',
    status: 'normal',
    crowdLevel: 'LOW',
    walkingTime: 6,
    walkingTimeAccessible: 9,
    cost: '$2.50',
    frequency: 'Every 5 mins',
    destinations: ['City Center', 'South Suburbs', 'Hotel District'],
    description: 'Direct route to hotels. Full step-free access.'
  },
  shuttleBus: {
    id: 'shuttleBus',
    name: 'Tournament Shuttle Bus',
    type: 'bus',
    location: 'East Plaza Hub',
    status: 'normal',
    crowdLevel: 'LOW',
    walkingTime: 8,
    walkingTimeAccessible: 11,
    cost: 'Free for Ticket Holders',
    frequency: 'Continuous loop',
    destinations: ['Fan Park', 'West Parking Lot', 'Park & Ride'],
    description: 'Tournament shuttle buses. Wheelchair ramps equipped on all vehicles.'
  },
  rideshare: {
    id: 'rideshare',
    name: 'Ride-Share Pickup Zone',
    type: 'rideshare',
    location: 'West Parking Lot Zone C',
    status: 'normal',
    crowdLevel: 'LOW',
    walkingTime: 10,
    walkingTimeAccessible: 15,
    cost: 'Varies',
    frequency: 'On demand',
    destinations: ['Custom Destination'],
    description: 'Designated Uber/Lyft/Taxi pickup. Expect congestion post-match.'
  },
  parkingAlpha: {
    id: 'parkingAlpha',
    name: 'Parking Lot Alpha',
    type: 'parking',
    location: 'North-West Lot',
    status: 'normal',
    crowdLevel: 'LOW',
    walkingTime: 12,
    walkingTimeAccessible: 16,
    cost: '$20.00',
    frequency: 'Self-drive',
    destinations: ['North Highways'],
    description: 'Pre-booked parking passes only. Accessible parking in rows A-C.'
  },
  parkingBeta: {
    id: 'parkingBeta',
    name: 'Parking Lot Beta',
    type: 'parking',
    location: 'North-East Lot',
    status: 'normal',
    crowdLevel: 'LOW',
    walkingTime: 12,
    walkingTimeAccessible: 16,
    cost: '$20.00',
    frequency: 'Self-drive',
    destinations: ['East Highways'],
    description: 'General matchday parking. Stair-free walkway to East Gates.'
  }
};

export const DEMO_SCENARIOS = {
  normal: {
    id: 'normal',
    name: 'Normal Match Day',
    description: 'Standard tournament operations. Crowd distribution is stable, and transit systems are operating normally.',
    crowds: {
      northGate: 'LOW',
      southGate: 'LOW',
      eastConcourse: 'MODERATE',
      westConcourse: 'LOW',
      foodCourt: 'MODERATE',
      metroExit: 'LOW',
      metroExitB: 'LOW',
      parkingZone: 'LOW',
      parkingZoneBeta: 'LOW',
      sectionA: 'MODERATE',
      sectionB: 'MODERATE',
      sectionC: 'MODERATE',
      sectionD: 'MODERATE'
    },
    incidents: [],
    transit: {
      metroA: 'normal',
      metroB: 'normal',
      shuttleBus: 'normal',
      rideshare: 'normal',
      parkingAlpha: 'normal',
      parkingBeta: 'normal'
    },
    occupancy: 42000,
    averageEntryTime: 4.5
  },
  surge: {
    id: 'surge',
    name: 'High Crowd Surge',
    description: 'A sudden surge of spectators arriving via Metro Terminal A causes critical bottlenecking at the North Gate.',
    crowds: {
      northGate: 'CRITICAL',
      southGate: 'LOW',
      eastConcourse: 'MODERATE',
      westConcourse: 'HIGH',
      foodCourt: 'MODERATE',
      metroExit: 'CRITICAL',
      metroExitB: 'LOW',
      parkingZone: 'MODERATE',
      parkingZoneBeta: 'LOW',
      sectionA: 'HIGH',
      sectionB: 'LOW',
      sectionC: 'LOW',
      sectionD: 'LOW'
    },
    incidents: [
      {
        id: 'inc-01',
        category: 'Crowd',
        location: 'North Gate Entrance',
        time: 'Just now',
        severity: 'Critical',
        status: 'Open',
        description: 'Spectator queues spilling onto external plaza. High risk of crush or barrier breach. Average entry wait exceeded 35 minutes.'
      }
    ],
    transit: {
      metroA: 'busy',
      metroB: 'normal',
      shuttleBus: 'normal',
      rideshare: 'normal',
      parkingAlpha: 'normal',
      parkingBeta: 'normal'
    },
    occupancy: 61000,
    averageEntryTime: 22.4
  },
  medical: {
    id: 'medical',
    name: 'Medical Incident',
    description: 'A spectator experiences a medical emergency in Seating Section B during high-density match play.',
    crowds: {
      northGate: 'LOW',
      southGate: 'LOW',
      eastConcourse: 'HIGH',
      westConcourse: 'LOW',
      foodCourt: 'HIGH',
      metroExit: 'LOW',
      metroExitB: 'LOW',
      parkingZone: 'LOW',
      parkingZoneBeta: 'LOW',
      sectionA: 'HIGH',
      sectionB: 'CRITICAL',
      sectionC: 'HIGH',
      sectionD: 'HIGH'
    },
    incidents: [
      {
        id: 'inc-02',
        category: 'Medical',
        location: 'Section B Seating',
        time: '3 mins ago',
        severity: 'Critical',
        status: 'Open',
        description: 'Spectator experiencing chest pains. Row 14, seat 12. Local crowd is congested, obstructing easy stretcher access.'
      }
    ],
    transit: {
      metroA: 'normal',
      metroB: 'normal',
      shuttleBus: 'normal',
      rideshare: 'normal',
      parkingAlpha: 'normal',
      parkingBeta: 'normal'
    },
    occupancy: 67500,
    averageEntryTime: 5.8
  },
  transport: {
    id: 'transport',
    name: 'Transport Disruption',
    description: 'A mechanical failure halts trains at Metro Terminal A, stranding post-match fans and overloading shuttle buses.',
    crowds: {
      northGate: 'HIGH',
      southGate: 'LOW',
      eastConcourse: 'CRITICAL',
      westConcourse: 'MODERATE',
      foodCourt: 'MODERATE',
      metroExit: 'CRITICAL',
      metroExitB: 'HIGH',
      parkingZone: 'HIGH',
      parkingZoneBeta: 'HIGH',
      sectionA: 'LOW',
      sectionB: 'LOW',
      sectionC: 'LOW',
      sectionD: 'LOW'
    },
    incidents: [
      {
        id: 'inc-03',
        category: 'Transport',
        location: 'Metro Terminal A Station',
        time: '5 mins ago',
        severity: 'High',
        status: 'Open',
        description: 'Transit authority reports signal failure. All outbound trains from Terminal A suspended for at least 45 minutes. Huge passenger backup.'
      },
      {
        id: 'inc-04',
        category: 'Crowd',
        location: 'East Plaza Hub (Shuttles)',
        time: 'Just now',
        severity: 'High',
        status: 'Open',
        description: 'Severe congestion at shuttle bus loading zone as fans try to bypass the disabled Metro Terminal A.'
      }
    ],
    transit: {
      metroA: 'critical',
      metroB: 'busy',
      shuttleBus: 'critical',
      rideshare: 'busy',
      parkingAlpha: 'normal',
      parkingBeta: 'normal'
    },
    occupancy: 58000,
    averageEntryTime: 6.2
  },
  evacuation: {
    id: 'evacuation',
    name: 'Emergency Evacuation',
    description: 'An emergency alarm is triggered due to a minor electrical fire in the main Food Court. Venue evacuation is initiated.',
    crowds: {
      northGate: 'CRITICAL',
      southGate: 'CRITICAL',
      eastConcourse: 'CRITICAL',
      westConcourse: 'CRITICAL',
      foodCourt: 'CRITICAL',
      metroExit: 'HIGH',
      metroExitB: 'HIGH',
      parkingZone: 'HIGH',
      parkingZoneBeta: 'HIGH',
      sectionA: 'CRITICAL',
      sectionB: 'CRITICAL',
      sectionC: 'CRITICAL',
      sectionD: 'CRITICAL'
    },
    incidents: [
      {
        id: 'inc-05',
        category: 'Infrastructure',
        location: 'Food Court Concourse',
        time: '1 min ago',
        severity: 'Critical',
        status: 'Open',
        description: 'Minor fire and smoke detected in food vendor storage unit. Automated suppression active. Full venue alarm sounding.'
      }
    ],
    transit: {
      metroA: 'busy',
      metroB: 'busy',
      shuttleBus: 'normal',
      rideshare: 'normal',
      parkingAlpha: 'busy',
      parkingBeta: 'busy'
    },
    occupancy: 68000,
    averageEntryTime: 45.0
  }
};

export const getRoutePath = (startId, endId, accessibilityOptions = {}) => {
  const start = STADIUM_ZONES[startId];
  const end = STADIUM_ZONES[endId];
  
  if (!start || !end) return [];
  
  const points = [{ x: start.x, y: start.y }];
  
  if (startId === endId) return points;

  const isAccessible = accessibilityOptions.wheelchair || accessibilityOptions.stepFree || accessibilityOptions.reducedWalking;
  
  if (start.y < 300 && end.y > 500) {
    if (isAccessible) {
      points.push({ x: 200, y: 220 });
      points.push({ x: 120, y: 400 });
      points.push({ x: 200, y: 580 });
    } else {
      points.push({ x: 600, y: 220 });
      points.push({ x: 680, y: 400 });
      points.push({ x: 600, y: 580 });
    }
  } else if (Math.abs(start.x - end.x) > 400) {
    const midY = start.y < 400 ? 250 : 550;
    points.push({ x: 400, y: midY });
  } else if ((start.isExternal && !end.isExternal) || (!start.isExternal && end.isExternal)) {
    const external = start.isExternal ? start : end;
    const internal = start.isExternal ? end : start;
    
    if (external.id.includes('metroExit') || external.id.includes('parking') || external.id.includes('metroExitB')) {
      if (internal.y < 400) {
        points.push({ x: 400, y: 120 });
      } else {
        points.push({ x: 400, y: 680 });
      }
    }
  }
  
  points.push({ x: end.x, y: end.y });
  return points;
};
