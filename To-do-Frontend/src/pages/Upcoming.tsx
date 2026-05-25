import TaskDateList from '../components/TaskDateList';

const Upcoming = () => (
  <TaskDateList
    title="Upcoming"
    subtitle="Tasks scheduled for future dates"
    filterType="upcoming"
  />
);

export default Upcoming;