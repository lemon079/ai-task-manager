import { ScheduleCalendar } from "@/components/calender/Calendar";
import Heading from "@/components/shared/Heading";
import { getTasks } from "@/lib/actions/task";
import { LayoutDashboard } from "lucide-react";

export default async function DashboardPage() {
  const tasks = await getTasks();

  return (
    <div className="bg-accent space-y-10">
      <section >
        <Heading
          title="Dashboard"
          subtitle="Here's an overview of your tasks."
          icon={<LayoutDashboard />}
        />
      </section>

      <div className="flex flex-col lg:flex-row justify-evenly items-stretch gap-4">

        {/* Right side (Calendar + Heading) */}
        <section className="flex-1">
          <Heading
            title="Events Schedule"
            subtitle="Handle all your events with ease!"
          />
          <div className="overflow-hidden">
            <ScheduleCalendar tasks={tasks} />
          </div>
        </section>

        {/* Left side (Chart) */}
        <section className="flex-1">
          <Heading
            title="Charts"
            subtitle="Keep track of your progress!"
          />
        </section>
      </div>
    </div>
  );
}
