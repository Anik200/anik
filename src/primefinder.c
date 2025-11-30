// Find the first 5 prime numbers (starting from 2)
#include<stdio.h>
int main()
{
    int num = 2, count = 0;
    while(count < 5)
    {
        int prime = 1; // on, 0 mane off
        for(int i = 2; i < num; i++)
        {
            if(num%i == 0)
            {
                prime = 0;
                break;
            }
        }
        if(prime)
        {
            printf("%d\n",num);
            count++;
        }
        num++;
    }
    return 0;
}