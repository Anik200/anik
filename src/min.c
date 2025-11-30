// Find minimum of 3 positive integers input by user
#include<stdio.h>
int main()
{
    int a,b,c;
    printf("enter the first number: ");
    scanf("%d",&a);
    printf("enter the second number: ");
    scanf("%d",&b);
    printf("enter the third number: ");
    scanf("%d",&c);
        if(a == b || a == c || b == c)
        {
            if(a == b && a == c)
            {
                printf("the numbers are same");
                return 0;
            }
            if(a == b)
            {
                if(c<b)
                {
                    printf("%d is the smallest",c);
                    return 0;
                }
                printf("%d is the smallest",a);
                return 0;
            }
            if (a == c)
            {
                if(b<c)
                {
                    printf("%d is the smallest",b);
                    return 0;
                }
                printf("%d is the smallest",a);
                return 0;
            }
            if(b == c)
            {
                if(a<b)
                {
                    printf("%d is the smallest",a);
                    return 0;
                }
                printf("%d is the smallest",b);
                return 0;
            }

        }
    if(a<b)
    {
            if(a<c)
            {
                printf("%d is the smallest",a);
                return 0;
            }
            printf("%d is the smallest",c);
            return 0;
    }
    if(b<c)
    {
            printf("%d is the smallest",b);
            return 0;
    }
    printf("%d is the smallest",c);
    return 0;
}