// Finding average of 3 integers input from user and display result
#include<stdio.h>
int main()
{
    int a, b, c, sum = 0;
    float avg;
    printf("enter the first number: ");
    scanf("%d",&a);
     printf("enter the second number: ");
    scanf("%d",&b);
     printf("enter the third number: ");
    scanf("%d",&c);
    sum = a + b + c;
    avg = (float)sum / 3;
    printf("average is %.2f",avg);
    return 0;
}