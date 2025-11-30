#include <stdio.h>
int main() {
    int a = 34, b = 52, c; // C is the third variable
    printf("Before Swap\n");
    printf("A = %d\n", a);
    printf("B = %d\n", b);
    c = a; 
    a = b; 
    b = c;
     printf("After Swap\n");
    printf("A = %d\n", a);
    printf("B = %d\n", b);
    return 0;
}