export default function getEventsListItemEl(event) {
  const {
    data: {
      description,
      created,
    },
    type,
  } = event;

  const date = created.toLocaleDateString();
  const time = created.toLocaleTimeString();

  const liEl = document.createElement('li');
  liEl.classList.add('events-list__item');

  liEl.insertAdjacentHTML('afterbegin', `
    <span data-id="event-time" class="events-list__time">${time} ${date}</span>
    <span data-id="event-description" class="events-list__description">${description}</span>
  `);

  const descriptionModifiers = {
    freekick: 'events-list__description_action_freekick',
    goal: 'events-list__description_action_goal',
  };

  const descriptionModifier = descriptionModifiers[type];

  if (descriptionModifiers) {
    liEl.querySelector('[data-id="event-description"]')
      .classList.add(descriptionModifier);
  }

  return liEl;
}
