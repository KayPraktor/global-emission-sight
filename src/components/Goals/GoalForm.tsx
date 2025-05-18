
import React, { useState } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { CalendarIcon } from "lucide-react";
import { format } from "date-fns";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { cn } from "@/lib/utils";

const goalFormSchema = z.object({
  title: z.string().min(2, {
    message: "Title must be at least 2 characters.",
  }).max(50, {
    message: "Title cannot exceed 50 characters.",
  }),
  description: z.string().max(500, {
    message: "Description cannot exceed 500 characters.",
  }).optional(),
  targetReduction: z.coerce.number().min(0, {
    message: "Target reduction must be a positive number.",
  }),
  scope: z.string({
    required_error: "Please select an emission scope.",
  }),
  targetDate: z.date({
    required_error: "Target date is required.",
  }),
  baselineYear: z.coerce.number().min(2000, {
    message: "Baseline year must be 2000 or later.",
  }).max(new Date().getFullYear(), {
    message: "Baseline year cannot be in the future.",
  }),
  targetYear: z.coerce.number().min(new Date().getFullYear(), {
    message: "Target year must be current year or later.",
  }),
  unit: z.string({
    required_error: "Please select a unit.",
  }),
});

type GoalFormValues = z.infer<typeof goalFormSchema>;

interface GoalFormProps {
  onComplete: () => void;
  initialData?: GoalFormValues;
}

const GoalForm = ({ onComplete, initialData }: GoalFormProps) => {
  const defaultValues: Partial<GoalFormValues> = {
    title: "",
    description: "",
    targetReduction: 0,
    scope: "Scope 1",
    targetDate: new Date(new Date().getFullYear() + 1, 11, 31), // End of next year
    baselineYear: new Date().getFullYear() - 1,
    targetYear: new Date().getFullYear() + 1,
    unit: "tCO₂e",
    ...initialData
  };

  const form = useForm<GoalFormValues>({
    resolver: zodResolver(goalFormSchema),
    defaultValues,
  });

  const onSubmit = (data: GoalFormValues) => {
    // In a real app, we would save this to the database
    console.log("Form data submitted:", data);
    toast.success("Goal created successfully");
    onComplete();
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Goal Title</FormLabel>
                <FormControl>
                  <Input placeholder="Reduce emissions by 25% by 2030" {...field} />
                </FormControl>
                <FormDescription>
                  A clear, concise title for your emissions goal.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Description</FormLabel>
                <FormControl>
                  <Textarea 
                    placeholder="Detailed description of your goal and the strategies to achieve it" 
                    {...field} 
                    rows={3}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="scope"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Emissions Scope</FormLabel>
                  <Select 
                    onValueChange={field.onChange} 
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an emissions scope" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="Scope 1">Scope 1 (Direct)</SelectItem>
                      <SelectItem value="Scope 2">Scope 2 (Indirect - Energy)</SelectItem>
                      <SelectItem value="Scope 3">Scope 3 (Indirect - Value Chain)</SelectItem>
                      <SelectItem value="All Scopes">All Scopes</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetReduction"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Reduction</FormLabel>
                  <div className="flex items-center">
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="25" 
                        {...field} 
                      />
                    </FormControl>
                    <span className="ml-2">%</span>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="baselineYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Baseline Year</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder={String(new Date().getFullYear() - 1)} 
                      {...field} 
                    />
                  </FormControl>
                  <FormDescription>
                    The reference year for reduction targets
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="targetYear"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Target Year</FormLabel>
                  <FormControl>
                    <Input 
                      type="number" 
                      placeholder={String(new Date().getFullYear() + 5)} 
                      {...field} 
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="targetDate"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Deadline</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant={"outline"}
                        className={cn(
                          "w-full pl-3 text-left font-normal",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value ? (
                          format(field.value, "PPP")
                        ) : (
                          <span>Pick a date</span>
                        )}
                        <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={field.value}
                      onSelect={field.onChange}
                      disabled={(date) =>
                        date < new Date()
                      }
                      initialFocus
                      className={cn("p-3 pointer-events-auto")}
                    />
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="unit"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Unit</FormLabel>
                <Select 
                  onValueChange={field.onChange} 
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select a unit" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="tCO₂e">tCO₂e (Tonnes CO₂ equivalent)</SelectItem>
                    <SelectItem value="%">Percentage Reduction</SelectItem>
                    <SelectItem value="kgCO₂e">kgCO₂e (Kilograms CO₂ equivalent)</SelectItem>
                    <SelectItem value="MtCO₂e">MtCO₂e (Million tonnes CO₂ equivalent)</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={onComplete}>
            Cancel
          </Button>
          <Button type="submit">Save Goal</Button>
        </div>
      </form>
    </Form>
  );
};

export default GoalForm;
