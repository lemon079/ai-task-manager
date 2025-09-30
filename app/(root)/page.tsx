"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useForm } from "react-hook-form";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";

const formSchema = z.object({
  input: z.string().min(2, { message: "Must be at least 2 characters." }),
});

type FormValues = z.infer<typeof formSchema>;

export default function Page() {
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { input: "" },
  });

  async function handleSubmit(formData: FormData) {
    const input = formData.get("input") as string;
    console.log("Submitted input:", input);
    // You can handle your input here (e.g., send to API)
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-xl font-bold mb-4">Simple Form</h1>
      <Form {...form}>
        <form action={handleSubmit} className="space-y-4">
          <FormField
            control={form.control}
            name="input"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Your Input</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your input" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full">
            Submit
          </Button>
        </form>
      </Form>
    </div>
  );
}
