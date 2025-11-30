#include <stdio.h>
#include <math.h>

double calculate_circle_area(double radius) {
    return M_PI * radius * radius;
}

int factorial(int n) {
    if (n <= 1) return 1;
    return n * factorial(n - 1);
}

int main() {
    double radius = 5.0;
    printf("Area of circle with radius %.2f: %.2f\n", 
           radius, calculate_circle_area(radius));
    
    int num = 5;
    printf("Factorial of %d: %d\n", num, factorial(num));
    
    return 0;
}