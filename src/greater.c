// check which number is greater among three numbers
#include<stdio.h>
int main()
{
    int a, b, c;
    printf("enter the first number");
    scanf("%d",&a);
    printf("ender the second number");
    scanf("%d",&b);
    printf("enter the third number");
    scanf("%d",&c);
    if(a > b)
    {
        if(a > c)
        {
            printf("%d is the greatest",a);
            return 0;
        }
        else
        {
            printf("%d is the greatest",c);
            return 0;
        }
    }
    else
    {
        if(b > c)
        {
            printf("%d is the greatest",b);
            return 0;
        }
        else
        {
            printf("%d is the greatest",c);
            return 0;
        }
    }
    return 0;
}