// input a string from a user and inpur a character to search and display where and how many times it appears
#include <stdio.h>
#include <string.h>

int main() {
    char str[100], ch;
    int i, count = 0;
    printf("Enter a string: ");
    fgets(str, sizeof(str), stdin);
    str[strcspn(str, "\n")] = '\0';
    printf("Enter the character to search: ");
    scanf("%c", &ch);
    printf("Character '%c' found at positions: ", ch);
    for (i = 0; str[i] != '\0'; i++) {
        if (str[i] == ch) {
            printf("%d ", i);
            count++;
        }
    }
    if (count == 0) {
        printf("\nCharacter '%c' is not present in the string.\n", ch);
    } else {
        printf("\nCharacter '%c' found %d time(s) in the string.\n", ch, count);
    }
    return 0;
}
