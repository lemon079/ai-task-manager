import { ScheduleCalendar } from "@/components/calender/Calendar";
import Heading from "@/components/shared/Heading";
import TaskTable from "@/components/tasks/TaskTable";
import { getTasks } from "@/lib/actions/task";

export default async function DashboardPage() {
  const tasks = await getTasks();

  return (
    <div className="bg-accent space-y-10">
      <div className="flex flex-col lg:flex-row justify-evenly items-stretch gap-4">

        {/* Right side (Calendar + Heading) */}
        <section className="flex-1">
          <Heading
            title="Tasks"
            subtitle="All of your tasks"
          />
          <TaskTable tasks={tasks} isDashboard />

        </section>

        {/* Left side (Chart) */}
        <section className="flex-1">
          <Heading
            title="Events Schedule"
            subtitle="Handle all your events with ease!"
          />
          <div className="overflow-hidden">
            <ScheduleCalendar tasks={tasks} />
          </div>
        </section>
      </div>
    </div>
  );
}
