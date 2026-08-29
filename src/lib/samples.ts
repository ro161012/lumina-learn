/** Built-in sample texts so the app is demo-ready in one click. */

export interface Sample {
  id: string
  title: string
  emoji: string
  blurb: string
  text: string
}

export const SAMPLES: Sample[] = [
  {
    id: 'photosynthesis',
    title: 'Photosynthesis',
    emoji: '🌱',
    blurb: 'Biology · how plants make food',
    text: `Photosynthesis is the process by which green plants, algae, and some bacteria convert light energy into chemical energy stored in glucose. The process takes place primarily in the leaves, inside organelles called chloroplasts. Chlorophyll is the green pigment that absorbs light energy, mainly from the red and blue parts of the spectrum.

Photosynthesis happens in two main stages. The light-dependent reactions occur in the thylakoid membranes, where light energy splits water molecules into oxygen, protons, and electrons. Oxygen is released as a byproduct of these reactions. The Calvin cycle, also called the light-independent stage, takes place in the stroma of the chloroplast. During the Calvin cycle, the enzyme RuBisCO captures carbon dioxide from the air and attaches it to a five-carbon sugar.

The overall equation for photosynthesis combines six molecules of carbon dioxide with six molecules of water to produce one molecule of glucose and six molecules of oxygen. Photosynthesis is essential because it produces the oxygen that nearly all living organisms breathe. It also forms the foundation of nearly every food chain on Earth, since plants make their own food and animals depend on them. Scientists estimate that photosynthesis produces over 100 billion tons of biomass every year.`,
  },
  {
    id: 'supply-demand',
    title: 'Supply & Demand',
    emoji: '📈',
    blurb: 'Economics · how markets set prices',
    text: `The law of demand states that when the price of a good rises, the quantity demanded falls, holding all else constant. This inverse relationship creates the downward-sloping demand curve. Consumers buy less of a good at higher prices because of the substitution effect and the income effect.

The law of supply states that when the price of a good rises, producers offer more of it for sale. Higher prices make production more profitable, so firms expand output. This direct relationship creates the upward-sloping supply curve.

Market equilibrium is the point where the supply curve and demand curve intersect. At the equilibrium price, the quantity that buyers want to purchase exactly equals the quantity that sellers want to sell. If the market price is above equilibrium, a surplus develops and sellers cut prices to clear inventory. If the price is below equilibrium, a shortage develops and competition among buyers pushes prices upward.

Elasticity measures how strongly quantity responds to a change in price. Demand for a good is elastic when consumers are very sensitive to price changes, and inelastic when they keep buying despite price increases. Necessities like medicine tend to have inelastic demand, while luxuries like vacations tend to be elastic.`,
  },
  {
    id: 'newton',
    title: "Newton's Laws",
    emoji: '🍎',
    blurb: 'Physics · motion and forces',
    text: `Newton's first law of motion states that an object at rest stays at rest, and an object in motion stays in motion at constant velocity, unless acted upon by a net external force. This property of matter is called inertia. Mass is the measure of an object's inertia.

Newton's second law states that the acceleration of an object is directly proportional to the net force acting on it and inversely proportional to its mass. The famous equation F equals m times a expresses this relationship. A force measured in newtons gives a one-kilogram mass an acceleration of one meter per second squared.

Newton's third law states that for every action force there is an equal and opposite reaction force. When you push on a wall, the wall pushes back on you with exactly the same strength. Rockets work because of this law: they push exhaust gases downward, and the gases push the rocket upward.

Friction is a force that opposes motion between two surfaces in contact. Air resistance is a special kind of friction that slows objects moving through the atmosphere. Terminal velocity is reached when air resistance grows strong enough to balance the force of gravity.`,
  },
]
