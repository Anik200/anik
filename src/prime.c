// write a c program to check whether a number is prime or not
#include<stdio.h>
int main()
{
    int a;
    printf("Enter a number: ");
    scanf("%d",&a);
    if(a%2 == 0)
    {
        printf("The number is not prime\n");
        return 0;
    }
    if(a%3 == 0)
    {
        printf("The number is not prime\n");
        return 0;
    }
    if(a%5 == 0)
    {
        printf("The number is not prime\n");
        return 0;
    }
    printf("The number is prime\n");
    return 0;
}