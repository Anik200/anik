// take an array of N integers ( N must be even and N < 20) and rearrange the array such that the second half of the array is placed before the first half of the array.
#include <stdio.h>
int main() {
    int N, i;
    int arr[20], temp[20];
    printf("Enter the number of integers (N < 20): ");
    scanf("%d", &N);
    if (N >= 20 || N <= 0 || N % 2 != 0) {
        printf("Invalid input. N must be even and between 1 and 19.\n");
        return 0;
    }
    printf("Enter %d integers:\n", N);
    for (i = 0; i < N; i++) {
        scanf("%d", &arr[i]);
    }
    int half = N / 2;
    int startSecondHalf = (N % 2 == 0) ? half : half + 1;
    int index = 0;
    for (i = startSecondHalf; i < N; i++) {
        temp[index++] = arr[i];
    }
    for (i = 0; i < startSecondHalf; i++) {
        temp[index++] = arr[i];
    }
    for (i = 0; i < N; i++) {
        arr[i] = temp[i];
    }
    printf("Rearranged array:\n");
    for (i = 0; i < N; i++) {
        printf("%d ", arr[i]);
    }
    printf("\n");
    return 0;
}
