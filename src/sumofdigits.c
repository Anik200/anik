// Find the sum of digits of an input positive integer; for example, if input integer is 423, sum of its digits will be 9
#include<stdio.h>
int main()
{
    int a, sum = 0, x;
    printf("Enter the number: ");
    scanf("%d",&a);
    if(a == 0)
    {
        printf("The Sum is %d\n",sum);
        return 0;
    }
    while(a != 0)
    {
        x = a % 10;
        sum = sum + x;
        a = a - x;
        a = a / 10;
    }
    printf("The sum is %d\n",sum);
    return 0;
}