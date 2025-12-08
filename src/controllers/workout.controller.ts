export class WorkoutController {
    private workouts: Workout[] = [];

    createWorkout(name: string, exercises: Exercise[]): Workout {
        const workout: Workout = {
            id: Date.now().toString(),
            name,
            exercises,
            createdAt: new Date(),
        };
        this.workouts.push(workout);
        return workout;
    }

    getWorkout(id: string): Workout | undefined {
        return this.workouts.find(w => w.id === id);
    }

    getAllWorkouts(): Workout[] {
        return this.workouts;
    }

    deleteWorkout(id: string): boolean {
        const index = this.workouts.findIndex(w => w.id === id);
        if (index > -1) {
            this.workouts.splice(index, 1);
            return true;
        }
        return false;
    }
}

interface Exercise {
    name: string;
    sets: number;
    reps: number;
    weight?: number;
}

interface Workout {
    id: string;
    name: string;
    exercises: Exercise[];
    createdAt: Date;
}